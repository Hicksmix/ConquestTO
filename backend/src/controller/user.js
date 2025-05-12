const { sha256 } = require("../helper/sha256");
const { makeId } = require("../helper/makeId")
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
    const title = "Login error";

    if (!(email?.length > 0) || !(password?.length > 0)) {
        res.status(400);
        return res.json({ title, text: "Incomplete data" });
    }

    let user = await getUserByMail(email);

    if (user === null) {
        res.status(400);
        return res.json({ title, text: "Wrong username or password" });
    }

    if (user.password === await sha256(password)) {
        return res.json({ jwt: sign({ userid: user.id }, process.env.JWT_SECRET) });
    }
    res.status(400);
    return res.json({ title, text: "Wrong username or password" });
}
/**
 * Registriert einen neuen User und loggt diesen direkt ein. Gibt im Erfolgsfall ein JWT Token im res zurück
 * @param username
 * @param password
 * @param email
 * @param pbwPin
 * @param res
 * @returns {Promise<*|null>} Promise mit dem JWT im res
 */
async function register(username, password, email, pbwPin, res) {
    const title = "Register error";

    if (!(username.length > 0) || !(password.length > 0) || !(email.length > 0)) {
        res.status(400);
        return res.json({ title, text: "Incomplete data" });
    }

    let user = await getUserByName(username);

    if (user !== null) {
        res.status(409);
        return res.json({ title, text: "Username already taken" });
    }

    user = await getUserByMail(email);

    if (user !== null) {
        res.status(409);
        return res.json({ title, text: "Email address already taken" });
    }

    const id = makeId(64);

    if (await createNewUser(id, username, await sha256(password), email, pbwPin)) {
        return res.json({ jwt: sign({ userid: id }, process.env.JWT_SECRET) });
    }
    res.status(500);
    return res.json({ title, text: "Something went wrong. Please try again later" });
}

module.exports = {login, register}