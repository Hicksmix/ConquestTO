const { verify } = require("jsonwebtoken");

/**
 * Middleware zum Verifizieren eines JWT Tokens
 * @param req 
 * @param res 
 * @param next 
 */
async function verifyJWT(req, res, next) {
    try {
        verify(req.query.jwt, process.env.JWT_SECRET);
        next();
    } catch (e) {
        res.status(403);
        res.json({ title: "Fehler", text: "Du musst angemeldet sein, um diesen Inhalt laden zu können", auth: false });
    }
}

module.exports = { verifyJWT };