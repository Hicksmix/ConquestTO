/**
 * ROUTEN
 *
 * Definiert die Routen für den URI api/*
 */
let express = require('express');
const {verify} = require("jsonwebtoken");
const {verifyJWT} = require("../src/middleware/verifyJWT");
const {login, register, loadUser, editUser, editUserPassword} = require("../src/controller/user")
const {
    loadTournamentsForOrga, createTournament, loadTournament, addPlayerToTournament, removePlayerFromTournament,
    startTournament, endTournamentRound, createNewRound, endTournament, startRound
} = require("../src/controller/tournament")
const {loadRoundForTournament, endGame, reopenGame, updateGameScore, swapPlayers} = require("../src/controller/game");
let router = express.Router();

// User
router.post('/user/login', async function (req, res) {
    await login(req.body.email, req.body.password, res);
});
router.put('/user/register', async function (req, res) {
    await register(req.body.username, req.body.password, req.body.email, req.body.pbwPin, res)
});
router.get('/user/load', verifyJWT, async function (req, res) {
    await loadUser(verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.post('/user/edit', verifyJWT, async function (req, res) {
    await editUser(verify(req.query.jwt, process.env.JWT_SECRET).userid, req.body.username, req.body.password, req.body.pbwPin, res)
});
router.post('/user/edit-password', verifyJWT, async function (req, res) {
    await editUserPassword(verify(req.query.jwt, process.env.JWT_SECRET).userid, req.body.oldPassword, req.body.newPassword, res)
});

// Tournament
router.put('/tournament/create', verifyJWT, async function (req, res) {
    await createTournament(req.body.name, req.body.date, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.get('/tournament/get-for-orga', verifyJWT, async function (req, res) {
    await loadTournamentsForOrga(verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.get('/tournament/get-tournament', verifyJWT, async function (req, res) {
    await loadTournament(req.query.tournamentId, res)
});
router.post('/tournament/add-player', verifyJWT, async function (req, res) {
    await addPlayerToTournament(req.body.pinOrMail, req.body.tournamentId, req.body.faction, req.body.teamName, res)
});
router.delete('/tournament/remove-player', verifyJWT, async function (req, res) {
    await removePlayerFromTournament(req.body.userId, req.body.tournamentId, res)
});
router.post('/tournament/start', verifyJWT, async function (req, res) {
    await startTournament(req.body.tournamentId, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.post('/tournament/end', verifyJWT, async function (req, res) {
    await endTournament(req.body.tournamentId, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.post('/tournament/end-round', verifyJWT, async function(req, res) {
    await endTournamentRound(req.body.tournamentId, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.post('/tournament/create-round', verifyJWT, async function(req, res) {
    await createNewRound(req.body.tournamentId, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});
router.post('/tournament/start-round', verifyJWT, async function(req, res) {
    await startRound(req.body.tournamentId, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});

// Games
router.get('/games/get-tournament-round', verifyJWT, async function (req, res) {
    await loadRoundForTournament(req.query.tournamentId, req.query.roundNr, res)
});
router.put('/games/end', verifyJWT, async function(req, res){
    await endGame(req.body.gameId, verify(req.query.jwt, process.env.JWT_SECRET).userid, req.body.tournamentId, res)
});
router.put('/games/reopen', verifyJWT, async function(req, res){
    await reopenGame(req.body.gameId, verify(req.query.jwt, process.env.JWT_SECRET).userid, req.body.tournamentId, res)
});
router.put('/games/update-score', verifyJWT, async function(req, res){
   await updateGameScore(req.body.game, verify(req.query.jwt, process.env.JWT_SECRET).userid, req.body.tournamentId, res)
});
router.put('/games/swap-players', verifyJWT, async function(req, res){
   await swapPlayers(req.body.game1Id, req.body.game2Id, req.body.userIdToSwapFromGame1, req.body.userIdToSwapFromGame2, verify(req.query.jwt, process.env.JWT_SECRET).userid, res)
});

module.exports = router;