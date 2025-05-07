const { sha256 } = require("../helper/sha256");
const { sign } = require("jsonwebtoken");
const { getUserByMail, createNewUser, getUserByName } = require("../database/user")

/**
 * Loggt einen User anhand von Benutzernamen und Passwort-Hash ein und gibt im Erfolgsfall ein JWT im result zurück
 * @param email
 * @param password
 * @param res
 * @returns {Promise<*|null>}: Promise mit dem JWT im res
 */
async function login(email, password, res) {
    const title = "Fehler beim Login";

    if (!(email?.length > 0) || !(password?.length > 0)) {
        res.status(400);
        return res.json({ title, text: "Unvollständige Daten" });
    }

    let sleeper = await getUserByMail(email);

    if (sleeper === null) {
        res.status(400);
        return res.json({ title, text: "Username oder Passwort falsch" });
    }

    if (sleeper.password === await sha256(password)) {
        return res.json({ jwt: sign({ userid: sleeper.id }, process.env.JWT_SECRET) });
    }
    res.status(400);
    return res.json({ title, text: "Username oder Passwort falsch" });
}
/**
 * Registriert einen neuen User und loggt diesen direkt ein. Gibt im Erfolgsfall ein JWT Token im res zurück
 * @param username
 * @param password
 * @param email
 * @param pbw_pin
 * @param res
 * @returns {Promise<*|null>} Promise mit dem JWT im res
 */
async function register(username, password, email, pbw_pin, res) {
    const title = "Fehler beim Registrieren";

    if (!(username.length > 0) || !(password.length > 0) || !(email.length > 0)) {
        res.status(400);
        return res.json({ title, text: "Unvollständige Daten" });
    }

    let sleeper = await getUserByName(username);

    if (sleeper !== null) {
        res.status(409);
        return res.json({ title, text: "Der Username ist bereits vergeben" });
    }

    sleeper = await getUserByMail(email);

    if (sleeper !== null) {
        res.status(409);
        return res.json({ title, text: "Unter dieser E-Mail ist bereits ein Account registriert" });
    }

    const id = makeid(64);

    if (await createNewUser(id, username, await sha256(password), email, pbw_pin)) {
        return res.json({ jwt: sign({ userid: id }, process.env.JWT_SECRET) });
    }
    res.status(500);
    return res.json({ title, text: "Da ist etwas schief gelaufen. Bitte versuche es nochmal." });
}

/**
 * HILFSFUNKTION
 * Generiert einen zufälligen String mit vorgegebener Länge
 *
 * @param length
 * @returns {string}
 */
function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {login, register}