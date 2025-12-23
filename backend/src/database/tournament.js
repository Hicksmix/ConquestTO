/**
 * DATENBANK
 *
 * Kapselt alle Datenbankanfragen an die Datenbank für die Tournaments-Tabelle
 */
// Import aller benötigten Models und anderweitigen Datenbank-Funktionen
const getConnection = require("./connection");
const Tournament = require('../model/tournament');
const TournamentUser = require("../model/tournament_user");

/**
 * Liefert ein Tournament-Objekt für die übergebene ID
 *
 * @param tournamentId
 * @returns {Promise<Tournament>}
 */
async function getTournament(tournamentId) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from tournaments where id = ? LIMIT 1', [tournamentId]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new Tournament(
                row[0]['id'],
                row[0]['name'],
                row[0]['date'],
                row[0]['end_date'],
                row[0]['max_players'],
                row[0]['country'],
                row[0]['city'],
                row[0]['zip'],
                row[0]['address'],
                row[0]['description'],
                row[0]['external_link'],
                row[0]['orga_id'],
                row[0]['state'],
                null,
                row[0]['current_round'],
                row[0]['current_round_state']
            )
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getTournamentPageCount(filters = {}) {
    let conn;
    let result;
    try {
        conn = await getConnection();
        let filterQuery = generateFilterQuery(filters);
        let row;
        if (filterQuery) row = await conn.query(`select CEILING(COUNT(*)/10) as pageCount from tournaments WHERE ${filterQuery}`);
        else row = await conn.query('select CEILING(COUNT(*)/10) as pageCount from tournaments');
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = row[0]['pageCount'];
        }
        return result > 0 ? result : 1;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getJoinedTournamentPageCount(userId) {
    let conn;
    let result;
    try {
        conn = await getConnection();
        const row = await conn.query('select CEILING(COUNT(*)/10) as pageCount from tournaments join tournament_user tu on tournaments.id = tu.tournament_id where tu.user_id = ?', [userId]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = row[0]['pageCount'];
        }
        return result > 0 ? result : 1;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getTournamentPage(pageNr, filters = {}) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        let filterQuery = generateFilterQuery(filters);
        let rows;
        if (filterQuery) rows = await conn.query(`select * from tournaments WHERE ${filterQuery} order by date desc limit 10 offset ?`, [(pageNr - 1) * 10]);
        else rows = await conn.query('select * from tournaments order by date desc limit 10 offset ?', [(pageNr - 1) * 10]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new Tournament(
                    row['id'],
                    row['name'],
                    row['date'],
                    row['end_date'],
                    row['max_players'],
                    row['country'],
                    row['city'],
                    row['zip'],
                    row['address'],
                    row['description'],
                    row['external_link'],
                    row['orga_id'],
                    row['state'],
                    null,
                    row['current_round'],
                    row['current_round_state']
                ))
            })
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getPlayerOverView(tournamentId) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('select u.id, u.username, u.pbw_pin, u.email, tu.faction, SoS, sum(IF(g.player1 = u.id, score1, score2)) as total_score, count(IF(g.winner_id = u.id and g.ended = 1, 1, null)) as win_count, count(IF(g.winner_id != u.id and g.winner_id is not null and g.ended = 1, 1, null)) as loss_count, count(IF(g.winner_id is null and g.player1 is not null and g.ended = 1, 1, null)) as draw_count, tu.team_name from tournament_user tu join users u on u.id = tu.user_id left join game g on (u.id = g.player1 or u.id = g.player2) and g.tournament_id = tu.tournament_id left join (select tu.user_id, sum(tournament_pts)/count(tournament_pts) as SoS from tournament_user tu join game g on (tu.user_id = g.player1 or tu.user_id = g.player2) and g.tournament_id = tu.tournament_id join (select ((cast(sum(IF(g.winner_id = tu.user_id, 2, 0)) as FLOAT) + sum(IF(g.winner_id is null, 1, 0))) / count(g.id)) as tournament_pts, tu.user_id as id from tournament_user tu join game g on (IF(g.ended = 1, (tu.user_id = g.player1 or tu.user_id = g.player2), null)) and g.tournament_id = tu.tournament_id where tu.tournament_id = ? group by tu.user_id) tp on tp.id = IF(player1 = tu.user_id, player2, player1) where tu.tournament_id = ? group by tu.user_id) SoSTable on SoSTable.user_id = tu.user_id where tu.tournament_id = ? group by u.id, tu.faction order by win_count DESC, draw_count DESC, SoS DESC, total_score DESC, loss_count DESC, u.id DESC;', [tournamentId, tournamentId, tournamentId]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new TournamentUser(row['id'], row['username'], row['pbw_pin'], row['email'], row['faction'], Number(row['win_count']), Number(row['loss_count']), Number(row['draw_count']), Number(row['total_score']), 2 * Number(row['win_count']) + Number(row['draw_count']), (Math.round(Number(row['SoS']) * 100) / 100).toFixed(2), row['has_been_paired_up_down'] === 1, row['has_received_bye'] === 1, row['team_name']))
            })
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getTournamentsByOrgaId(orgaId) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        const rows = await conn.query('select * from tournaments where orga_id = ? order by date desc', [orgaId]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new Tournament(
                    row['id'],
                    row['name'],
                    row['date'],
                    row['end_date'],
                    row['max_players'],
                    row['country'],
                    row['city'],
                    row['zip'],
                    row['address'],
                    row['description'],
                    row['external_link'],
                    row['orga_id'],
                    row['state'],
                    null,
                    row['current_round'],
                    row['current_round_state']
                ))
            })
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getTournamentsForParticipant(userId, pageNr) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        const rows = await conn.query('select tournaments.* from tournaments join tournament_user tu on tournaments.id = tu.tournament_id where tu.user_id = ? order by date desc limit 10 offset ?', [userId, (pageNr - 1) * 10]);
        if (rows.length > 0) { // Wenn 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new Tournament(
                    row['id'],
                    row['name'],
                    row['date'],
                    row['end_date'],
                    row['max_players'],
                    row['country'],
                    row['city'],
                    row['zip'],
                    row['address'],
                    row['description'],
                    row['external_link'],
                    row['orga_id'],
                    row['state'],
                    null,
                    row['current_round'],
                    row['current_round_state']
                ))
            })
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * Erstellt ein neues Turnier
 * @param id
 * @param name
 * @param date
 * @param orgaId
 * @param endDate
 * @param maxPlayers
 * @param country
 * @param city
 * @param zip
 * @param address
 * @param description
 * @param externalLink
 * @returns {Promise<boolean>}
 */
async function createNewTournament(id, name, date, orgaId, endDate, maxPlayers, country, city, zip, address, description, externalLink) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            let row = await conn.query('insert into `tournaments` (id, name, orga_id, date, created_at, state, current_round, end_date, max_players, country, city, zip, address, description, external_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, name, orgaId, date, new Date(), "created", 0, endDate, maxPlayers, country, city, zip, address, description, externalLink]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function setTournamentState(state, tournamentId) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournaments` set state = ? where id = ?', [state, tournamentId])
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

async function setCurrentRoundState(tournamentId, state) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournaments` set current_round_state = ? where id = ?', [state, tournamentId])
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

async function setCurrentRound(tournamentId, roundNr) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournaments` set current_round = ? where id = ?', [roundNr, tournamentId])
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

function generateFilterQuery(filters) {
    if (!filters) return;
    let filterStrings = [];
    if (filters['fromDate']) filterStrings.push(` tournaments.date >= '${filters['fromDate']}' OR tournaments.end_date >= '${filters['fromDate']}'`);
    if (filters['toDate']) filterStrings.push(` tournaments.date <= '${filters['fromDate']}' OR tournaments.end_date <= '${filters['fromDate']}'`);
    if (filters['country']) filterStrings.push(` tournaments.country LIKE '%${filters['country']}%'`);
    if (filters['city']) filterStrings.push(` tournaments.city LIKE '%${filters['city']}%'`);
    if (filters['maxPlayers']) filterStrings.push(` tournaments.max_players = '${filters['maxPlayers']}'`);
    if (filters['hasSlots']) filterStrings.push(` tournaments.max_players > (SELECT COUNT(*) FROM tournament_user WHERE tournament_user.tournament_id = tournaments.id)`);
    if (filters['name']) filterStrings.push(` tournaments.name LIKE '%${filters['name']}%'`)
    return filterStrings.length > 0 ? filterStrings.join(' AND ') : null;
}

module.exports = {
    getTournament,
    getTournamentsByOrgaId,
    getTournamentPageCount,
    getJoinedTournamentPageCount,
    getTournamentPage,
    getTournamentsForParticipant,
    createNewTournament,
    getPlayerOverView,
    setTournamentState,
    setCurrentRoundState,
    setCurrentRound
}