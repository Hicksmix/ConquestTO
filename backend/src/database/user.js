/**
 * DATENBANK
 *
 * Kapselt alle Datenbankanfragen an die Datenbank für die Users-Tabelle
 */
// Import aller benötigten Models und anderweitigen Datenbank-Funktionen
const getConnection = require("./connection");
const User = require('../model/user');

/**
 * Liefert ein User-Objekt für die übergebene Email
 *
 * @param email
 * @returns {Promise<User>}
 */
async function getUserByMail(email) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from users where email = ? LIMIT 1', [email]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new User(row[0]['id'], row[0]['username'], row[0]['password'], row[0]['email'], row[0]['pbw_pin']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * Liefert ein User-Objekt für den übergebenen Username
 *
 * @param username
 * @returns {Promise<User>}
 */
async function getUserByName(username) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from users where username = ? LIMIT 1', [username]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new User(row[0]['id'], row[0]['username'], row[0]['password'], row[0]['email'], row[0]['pbw_pin']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * Liefert ein User-Objekt für den übergebenen PBW Pin
 *
 * @param pin
 * @returns {Promise<User>}
 */
async function getUserByPin(pin) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from users where pbw_pin = ? LIMIT 1', [pin]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new User(row[0]['id'], row[0]['username'], row[0]['password'], row[0]['email'], row[0]['pbw_pin']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * Liefert ein User-Objekt für die übergebene ID
 *
 * @param id
 * @returns {Promise<User>}
 */
async function getUser(id) {
    let result = null;
    let conn;
    try {
        conn = await getConnection();
        let row = await conn.query('select * from users where id = ? LIMIT 1', [id]);
        if (row.length === 1) { // Wenn 1 Ergebnis gefunden wurde
            result = new User(row[0]['id'], row[0]['username'], row[0]['password'], row[0]['email'], row[0]['pbw_pin']);
        }
        return result;
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * Erstellt einen neuen User
 * @param id
 * @param username
 * @param password
 * @param email
 * @param pbwPin
 * @returns {Promise<boolean>}
 */
async function createNewUser(id, username, password, email, pbwPin) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('insert into `users` (id, username, email, password, pbw_pin, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, username, email, password, pbwPin, new Date()]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function updateUser(id, username, pbwPin) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `users` set username = ?, pbw_pin = ? where id = ?', [username, pbwPin, id]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

async function updateUserPassword(id, password) {
    let conn;
    try {
        conn = await getConnection();
        let row;
        if (conn) {
            row = await conn.query('update `users` set password = ? where id = ?', [password, id]);
            return row.affectedRows === 1;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (conn) await conn.end();
    }
}

module.exports = { getUserByMail, getUserByName, createNewUser, getUser, getUserByPin, updateUser, updateUserPassword }