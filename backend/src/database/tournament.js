/**
 * DATENBANK
 *
 * Kapselt alle Datenbankanfragen an die Datenbank für die Tournaments-Tabelle
 */
// Import aller benötigten Models und anderweitigen Datenbank-Funktionen
const getConnection = require("./connection");
const Tournament = require('../model/tournament');

/**
 * Liefert ein Tournament-Objekt für die übergebene ID
 *
 * @param id
 * @returns {Promise<Tournament>}
 */
async function getTournament(id) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from tournaments where id = ? LIMIT 1', [id]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new Tournament(row[0]['id'], row[0]['name'], row[0]['date'], row[0]['orga_id'], row['ended']);
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
        const rows = await conn.query('select * from tournaments where orga_id = ?', [orgaId]);
        if (rows.length > 0) { // Wenn mind. 1 Ergebnis gefunden wurde
            rows.forEach(row => {
                result.push(new Tournament(row['id'], row['name'], row['date'], row['orga_id'], row['ended']))
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
                result.push(new Tournament(row['id'], row['name'], row['date'], row['orga_id'], row['ended']))
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
            let row = await conn.query('insert into `tournaments` (id, name, orga_id, date, created_at, ended) VALUES (?, ?, ?, ?, ?, ?)', [id, name, orgaId, date, new Date(), false]);
            if (row.affectedRows === 1) return true;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

module.exports = { getTournament, getTournamentsByOrgaId, getTournamentsForParticipant, createNewTournament }