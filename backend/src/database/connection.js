/**
 * DATENBANK
 *
 * Stellt eine Verbindung zur Datenbank her
 */

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    connectionLimit: 5,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    dateStrings: true,
});

/**
 * Gibt eine Verbindung aus dem Pool an Datenbank-Verbindungen zurück
 *
 * @returns {Promise<PoolConnection>}
 */
async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Datenbankverbindung erfolgreich hergestellt.');
        return connection;
    } catch (err) {
        console.error('Datenbankverbindung fehlgeschlagen:', err.message);
        throw err;
    }
}
module.exports = getConnection;