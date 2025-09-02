const {
    getGamesForTournamentRound,
    getGameWithPlayerNames,
    updateGame,
    getGame
} = require("../database/game");
const {getTournament, getPlayerOverView} = require("../database/tournament");
const {checkCanEndRound} = require("./tournament");

/**
 * Lädt die Daten einer Turnierrunde und liefert diese zurück
 * @param tournamentId
 * @param roundNr
 * @param res
 * @returns {Promise<*>}
 */
async function loadRoundForTournament(tournamentId, roundNr, res) {
    const title = "Error loading tournament round";

    if (!(tournamentId?.length > 0) || !(roundNr?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }
    let games = await getGamesForTournamentRound(tournamentId, roundNr);
    return res.json({games});
}

/**
 * Beendet ein Spiel und liefert die aktualisierten Turnierdaten zurück
 * @param gameId
 * @param userId
 * @param res
 * @returns {Promise<*>}
 */
async function endGame(game, userId, res) {
    const title = "Error ending game";

    if (!game || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }
    const gameClone = await getGameWithPlayerNames(game.id);
    let tournament = await getTournament(game.tournamentId);

    if (tournament?.orgaId !== userId && gameClone.player1Id !== userId && gameClone.player2Id !== userId) {
        res.status(403);
        return res.json({title, text: "Only the organizer or participants can end a game"});
    }

    game.ended = true;
    if (await updateGame(game)) {
        if (tournament) {
            tournament.games = await getGamesForTournamentRound(tournament.id, game.roundNr);

            tournament.players = await getPlayerOverView(tournament.id);
            tournament.canEndRound = await checkCanEndRound(tournament);
            return res.json({tournament});
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Eröffnet ein zuvor geschlossenes Spiel und liefert die aktualisierten Turnierdaten zurück
 * @param gameId
 * @param userId
 * @param tournamentId
 * @param res
 * @returns {Promise<*>}
 */
async function reopenGame(gameId, userId, tournamentId, res) {
    const title = "Error reopening game";

    if (!(gameId + ''.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const game = await getGameWithPlayerNames(gameId);
    const tournament = await getTournament(tournamentId);

    if (tournament.currentRoundState !== "ongoing" || tournament.currentRound !== game.roundNr) {
        res.status(403);
        return res.json({title, text: "You can only reopen games of ongoing rounds"});
    }

    if (tournament?.orgaId !== userId && game.player1Id !== userId && game.player2Id !== userId) {
        res.status(403);
        return res.json({title, text: "Only the organizer or participants can reopen a game"});
    }

    game.ended = false;
    if (await updateGame(game)) {
        if (tournament) {
            tournament.games = await getGamesForTournamentRound(tournamentId, game.roundNr);

            tournament.players = await getPlayerOverView(tournamentId);
            tournament.canEndRound = await checkCanEndRound(tournament);
            return res.json({tournament});
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Aktualisiert ein Spiel und liefert die aktualisierten Turnierdaten zurück
 * @param partialGame
 * @param userId
 * @param tournamentId
 * @param res
 * @returns {Promise<*>}
 */
async function updateGameScore(partialGame, userId, tournamentId, res) {
    const title = "Error updating game score";

    if (!(partialGame.id + ''.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let game = await getGameWithPlayerNames(partialGame.id);
    let tournament = null;
    if (tournamentId) tournament = await getTournament(tournamentId);


    if (tournament.currentRoundState !== "ongoing" || tournament.currentRound !== game.roundNr) {
        res.status(403);
        return res.json({title, text: "You can only update games of ongoing rounds"});
    }

    if ((tournament && tournament.orgaId !== userId) && game.player1Id !== userId && game.player2Id !== userId) {
        res.status(403);
        return res.json({title, text: "Only the organizer or participants can update a game"});
    }

    game = {...game, ...partialGame}

    if (await updateGame(game)) {
        game = await getGameWithPlayerNames((game.id));
        return res.json(game);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Tauscht zwei Spieler in den Paarungen und liefert die aktualisierten Turnierdaten zurück
 * @param game1Id
 * @param game2Id
 * @param userIdToSwapFromGame1
 * @param userIdToSwapFromGame2
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
async function swapPlayers(game1Id, game2Id, userIdToSwapFromGame1, userIdToSwapFromGame2, orgaId, res) {
    const title = "Error swapping players";

    if (!game1Id|| !game2Id || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let game1 = await getGame(game1Id);
    let game2 = await getGame(game2Id);

    if (!game1 || !game2) {
        res.status(400);
        return res.json({title, text: "Game not found"});
    }

    if (game1.tournamentId !== game2.tournamentId) {
        res.status(400);
        return res.json({title, text: "Games are not from the same tournament"});
    }

    if ((game1.player1Id !== userIdToSwapFromGame1 && game1.player2Id !== userIdToSwapFromGame1) ||
        (game2.player1Id !== userIdToSwapFromGame2 && game2.player2Id !== userIdToSwapFromGame2)) {
        res.status(400);
        return res.json({title, text: "Players not in selected games"});
    }

    let tournament = await getTournament(game1.tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can swap players"});
    }

    if(tournament.currentRound !== game1.roundNr && tournament.currentRound !== game2.roundNr && tournament.currentRoundState !== "created") {
        res.status(403);
        return res.json({title, text: "You can't swap matchups in ongoing or ending rounds"});
    }

    // Überprüft, welcher der beiden Spieler vom ersten der beiden gefundenen Spiele, getauscht werden muss
    if (game1.player1Id === userIdToSwapFromGame1) {
        game1.player1Id = userIdToSwapFromGame2;
    } else {
        game1.player2Id = userIdToSwapFromGame2;
    }

    // Überprüft, welcher der beiden Spieler vom zweiten der beiden gefundenen Spiele, getauscht werden muss
    if (game2.player1Id === userIdToSwapFromGame2) {
        game2.player1Id = userIdToSwapFromGame1;
    } else {
        game2.player2Id = userIdToSwapFromGame1;
    }

    if (await updateGame(game1) && await updateGame(game2)) {
        tournament.players = await getPlayerOverView(tournament.id);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

module.exports = {
    loadRoundForTournament, endGame, reopenGame, updateGameScore, swapPlayers
}