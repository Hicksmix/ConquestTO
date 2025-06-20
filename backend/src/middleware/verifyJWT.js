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
        res.json({ title: "Error", text: "You must be logged in to view this content", auth: false });
    }
}

module.exports = { verifyJWT };