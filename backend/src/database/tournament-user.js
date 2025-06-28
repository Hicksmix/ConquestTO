const getConnection = require("./connection");


async function createTournamentUser(userId, tournamentId, faction) {
    let conn;
    try {
        conn = await getConnection();
        if (conn) {
            const row = await conn.query('insert into `tournament_user` (user_id, tournament_id, faction) VALUES (?, ?, ?)', [userId, tournamentId, faction]);
            return row.affectedRows === 1;
        }
        return null;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function deleteTournamentUser(userId, tournamentId) {
    let conn;
    try {
        conn = await getConnection();
        if (conn) {
            await conn.query('delete from `tournament_user` where user_id = ? and tournament_id = ?', [userId, tournamentId])
            return true;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        if (conn) await conn.end();
    }
}

async function setHasReceivedBye(playerId, tournamentId, hasReceivedBye) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournament_user` set has_received_bye = ? where user_id = ? and tournament_id = ?', [hasReceivedBye, playerId, tournamentId]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function setHasBeenPairedUpDown(playerId, tournamentId, hasBeenPairedUpDown) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `tournament_user` set has_been_paired_up_down = ? where user_id = ? and tournament_id = ?', [hasBeenPairedUpDown, playerId, tournamentId]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

module.exports = {
    createTournamentUser,
    deleteTournamentUser,
    setHasReceivedBye,
    setHasBeenPairedUpDown
}