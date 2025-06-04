/**
 * ROUTEN
 *
 * Definiert die Routen für den URI api/*
 */
let express = require('express');
const { verify } = require("jsonwebtoken");
const { verifyJWT } = require("../src/middleware/verifyJWT");
const { login, register } = require("../src/controller/user")
const { loadTournamentsForOrga, createTournament, loadTournament, addPlayerToTournament, removePlayerFromTournament} = require("../src/controller/tournament")
let router = express.Router();

router.post('/user/login', async function(req, res){
    await login(req.body.email, req.body.password, res);
});
router.put('/user/register', async function(req, res){
    await register(req.body.username, req.body.password, req.body.email, req.body.pbwPin, res)
});

router.put('/tournament/create', verifyJWT, async function(req, res){
   await createTournament(req.body.name, req.body.date, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.get('/tournament/get-for-orga', verifyJWT, async function(req, res) {
    await loadTournamentsForOrga(verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.get('/tournament/get-tournament', verifyJWT, async function(req, res) {
    await loadTournament(req.query.tournamentId, res)
});
router.post('/tournament/add-player', verifyJWT, async function(req, res) {
   await addPlayerToTournament(req.body.pinOrMail, req.body.tournamentId, req.body.faction, res)
});
router.delete('/tournament/remove-player', verifyJWT, async function(req, res){
    await removePlayerFromTournament(req.body.userId, req.body.tournamentId, res)
});

module.exports = router;