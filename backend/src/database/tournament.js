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
            result = new Tournament(row[0]['id'], row[0]['name'], row[0]['date'], row[0]['orga_id'], row[0]['state'], null, row[0]['current_round'], row[0]['current_round_finished'] === 1);
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
        let rows = await conn.query('select u.id, u.username, u.pbw_pin, u.email, tu.faction, SoS, sum(case when g.player1 = u.id then score1 else score2 end) as total_score, count(case when g.winner_id = u.id then 1 else null end) as win_count, count(case when g.winner_id != u.id and g.winner_id is not null then 1 else null end) as loss_count, count(case when g.winner_id is null and g.player1 is not null then 1 else null end) as draw_count, tu.team_name from tournament_user tu join users u on u.id = tu.user_id left join game g on (u.id = g.player1 or u.id = g.player2) and g.tournament_id = tu.tournament_id left join (select tu.user_id, sum(tournament_pts)/count(tournament_pts) as SoS from tournament_user tu join game g on (tu.user_id = g.player1 or tu.user_id = g.player2) and g.tournament_id = tu.tournament_id join (select ((cast(sum(case when g.winner_id = tu.user_id then 2 else 0 end) as FLOAT) + sum(case when g.winner_id is null then 1 else 0 end)) / count(g.id)) as tournament_pts, tu.user_id as id from tournament_user tu join game g on (tu.user_id = g.player1 or tu.user_id = g.player2) and g.tournament_id = tu.tournament_id where tu.tournament_id = ? group by tu.user_id) tp on tp.id = IF(player1 = tu.user_id, player2, player1) where tu.tournament_id = ? group by tu.user_id) SoSTable on SoSTable.user_id = tu.user_id where tu.tournament_id = ? group by u.id, tu.faction order by win_count DESC, draw_count DESC, SoS DESC, total_score DESC, loss_count DESC, u.id DESC;', [tournamentId, tournamentId, tournamentId]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new TournamentUser(row['id'], row['username'], row['pbw_pin'], row['email'], row['faction'], Number(row['win_count']), Number(row['loss_count']), Number(row['draw_count']), Number(row['total_score']), 2 * Number(row['win_count']) + Number(row['draw_count']), Number(row['SoS']), row['has_been_paired_up_down'] === 1, row['has_received_bye'] === 1, row['team_name']))
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
                result.push(new Tournament(row['id'], row['name'], row['date'], row['orga_id'], row['state']))
            })
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getTournamentsForParticipant(userId) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        const rows = await conn.query('select * from tournaments join tournament_user tu on tournaments.id = tu.tournament_id where tu.user_id = ?', [userId]);
        if (rows.length > 0) { // Wenn 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new Tournament(row['id'], row['name'], row['date'], row['orga_id'], row['state']))
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
 * @returns {Promise<boolean>}
 */
async function createNewTournament(id, name, date, orgaId) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            let row = await conn.query('insert into `tournaments` (id, name, orga_id, date, created_at, state, current_round) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, name, orgaId, date, new Date(), "created", 0]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function setTournamentState(state, tournamentId){
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

async function setCurrentRoundFinished(tournamentId, finished){
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournaments` set current_round_finished = ? where id = ?', [finished, tournamentId])
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

module.exports = {
    getTournament,
    getTournamentsByOrgaId,
    getTournamentsForParticipant,
    createNewTournament,
    getPlayerOverView,
    setTournamentState,
    setCurrentRoundFinished,
    setCurrentRound
}