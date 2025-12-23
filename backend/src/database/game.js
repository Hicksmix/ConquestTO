/**
 * DATENBANK
 *
 * Kapselt alle Datenbankanfragen an die Datenbank für die Tournaments-Tabelle
 */
// Import aller benötigten Models und anderweitigen Datenbank-Funktionen
const getConnection = require("./connection");
const Game = require("../model/gameDTO");

async function getGamesForTournamentRound(tournamentId, roundNr) {
    let result = [];
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('Select g.*, gu1.username as username1, gu2.username as username2 from game g join (select u.username, u.id from users u join game g on u.id = g.player1) gu1 on g.player1 = gu1.id left join (select u.username, u.id from users u join game g on u.id = g.player2) gu2 on g.player2 = gu2.id where g.tournament_id = ? and g.round_nr = ? group by g.table_nr ORDER BY g.table_nr ASC', [tournamentId, roundNr]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach((row) => result.push(new Game(row['id'], row['player1'], row['player2'], row['username1'], row['username2'], row['tournament_id'], row['round_nr'], row['score1'], row['score2'], row['ended'] === 1, row['winner_id'], row['table_nr'], row['scenario'])))
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function setGameEnded(gameId, ended) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `game` set ended = ? where id = ?', [ended, gameId]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

async function getGameWithPlayerNames(gameId) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('Select g.*, gu1.username as username1, gu2.username as username2 from game g join (select u.username, u.id from users u join game g on u.id = g.player1) gu1 on g.player1 = gu1.id left join (select u.username, u.id from users u join game g on u.id = g.player2) gu2 on g.player2 = gu2.id where g.id = ? group by g.id LIMIT 1', [gameId]);
        if (rows.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            let row = rows[0];
            result = new Game(row['id'], row['player1'], row['player2'], row['username1'], row['username2'], row['tournament_id'], row['round_nr'], row['score1'], row['score2'], row['ended'] === 1, row['winner_id'], row['table_nr'], row['scenario']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getGame(gameId) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('Select * from game where id = ? LIMIT 1', [gameId]);
        if (rows.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            let row = rows[0];
            result = new Game(row['id'], row['player1'], row['player2'], undefined, undefined, row['tournament_id'], row['round_nr'], row['score1'], row['score2'], row['ended'] === 1, row['winner_id'], row['table_nr'], row['scenario']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function updateGame(game) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `game` set table_nr=?, round_nr=?, scenario=?, player1=?, player2=?, winner_id=?, score1=?, score2=? where id=?', [game.tableNr, game.roundNr, game.scenario, game.player1Id, game.player2Id, game.winnerId, game.score1, game.score2, game.id]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function createGames(games) {
    {
        let conn;
        try {
            conn = await getConnection();
            let row;
            if (conn) {
                row = await conn.query('insert into `game` (player1, player2, tournament_id, round_nr, score1, score2, ended, winner_id, scenario, table_nr) VALUES ' + expand(games.length, 10), flatten(games));
                return row.affectedRows > 0;
            }
        } catch (e) {
            console.log(e);
        } finally {
            if (conn) await conn.end();
        }
    }
}

async function getMatchupsToAvoidForTournamentUser(userId, tournamentId) {
    let conn;
    try {
        conn = await getConnection();
        let result = [];
        if (conn) {
            let rows = await conn.query('Select (case when player1 = ? then player2 else player1 end) as matchup from game where (player1 = ? or player2 = ?) and tournament_id = ?', [userId, userId, userId, tournamentId])
            if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
                rows.forEach((row) => result.push(row['matchup']));
            }
            return result;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

async function getGameCountForFactionAndDate(faction, date) {
    let result = 0;
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('SELECT COUNT(*) as gameCount FROM `game` JOIN tournament_user ON game.tournament_id = tournament_user.tournament_id AND (game.player1 = tournament_user.user_id OR game.player2 = tournament_user.user_id) WHERE tournament_user.faction = ? AND game.date >= ?;', [faction, date]);
        if (rows.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = rows[0]['pageCount'];
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function getWinCountForFactionAndDate(faction, date) {
    let result = 0;
    let conn;
    try {
        conn = await getConnection();
        let rows = await conn.query('SELECT COUNT(*) as gameCount FROM `game` JOIN tournament_user ON game.tournament_id = tournament_user.tournament_id AND game.winner_id = tournament_user.user_id WHERE tournament_user.faction = ? AND game.date >= ?;', [faction, date]);
        if (rows.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = rows[0]['pageCount'];
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

// expand(3, 2) returns "($, $), ($, $), ($, $)"
function expand(rowCount, columnCount, startAt = 1) {
    var index = startAt;
    return Array(rowCount).fill(0).map(v => `(${Array(columnCount).fill(0).map(v => `?`).join(", ")})`).join(", ")
}

// flatten([[1, 2], [3, 4]]) returns [1, 2, 3, 4]
function flatten(arr) {
    var newArr = []
    arr.forEach(v => v.forEach(p => newArr.push(p)))
    return newArr
}

module.exports = {
    getGamesForTournamentRound,
    getGameWithPlayerNames,
    getGame,
    setGameEnded,
    updateGame,
    createGames,
    getMatchupsToAvoidForTournamentUser,
    getGameCountForFactionAndDate,
    getWinCountForFactionAndDate
}