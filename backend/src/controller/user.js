const {sha256} = require("../helper/sha256");
const {makeId} = require("../helper/makeId")
const {sign} = require("jsonwebtoken");
const {getUserByMail, createNewUser, getUserByName, getUserByPin, getUser, updateUser} = require("../database/user")

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
        return res.status(400).res.json({title, text: "Incomplete data"});
    }

    let user = await getUserByMail(email);

    if (user === null) {
        return res.status(400).json({title, text: "Wrong username or password"});
    }

    if (user.password === await sha256(password)) {
        user.password = null;
        return res.status(200).json({jwt: sign({userid: user.id}, process.env.JWT_SECRET), user});
    }

    return res.status(400).json({title, text: "Wrong username or password"});
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

    if (!(username?.length > 0) || !(password?.length > 0) || !(email?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let user = await getUserByName(username);

    if (user !== null) {
        res.status(409);
        return res.json({title, text: "Username already taken"});
    }

    user = await getUserByMail(email);

    if (user !== null) {
        res.status(409);
        return res.json({title, text: "Email address already taken"});
    }

    if (pbwPin) {
        user = await getUserByPin(pbwPin);

        if (user !== null) {
            res.status(409);
            return res.json({title, text: "PBW Pin already taken"});
        }
    }

    const id = makeId(64);

    if (await createNewUser(id, username, await sha256(password), email, pbwPin)) {
        user = await getUser(id);
        user.password = null;
        return res.status(200).json({jwt: sign({userid: id}, process.env.JWT_SECRET), user});
    }
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function loadUser(id, res) {
    const title = "Error loading user";

    let user = await getUser(id);

    if (user === null) {
        res.status(400);
        return res.json({title, text: "User not found"});
    }

    user.password = null;
    return res.json(user);
}

async function editUser(id, username, password, pbwPin, res) {
    const title = "Error editing user";

    if (!(username?.length > 0) || !(password?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let user = await getUserByName(username);
    let userById = await getUser(id);

    if (user !== null && user.username !== userById.username) {
        res.status(409);
        return res.json({title, text: "Username already taken"});
    }

    if (pbwPin) {
        user = await getUserByPin(pbwPin);

        if (user !== null && user.pbwPin !== userById.pbwPin) {
            res.status(409);
            return res.json({title, text: "PBW Pin already taken"});
        }
    }

    if (userById.password !== await sha256(password)) {
        res.status(400);
        return res.json({title, text: "Wrong username or password"});
    }

    if (await updateUser(id, username, pbwPin)) {
        user = await getUser(id);
        user.password = null;
        return res.json(user);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

module.exports = {login, register, loadUser, editUser}