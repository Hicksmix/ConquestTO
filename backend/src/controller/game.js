const {
    getGamesForTournamentRound,
    getGameWithPlayerNames,
    setGameEnded,
    updateGame,
    getGame
} = require("../database/game");
const {getTournament, getPlayerOverView} = require("../database/tournament");
const {checkCanEndRound} = require("./tournament");

async function loadRoundForTournament(tournamentId, roundNr, res) {
    const title = "Error loading tournament round";

    if (!(tournamentId?.length > 0) || !(roundNr?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }
    let games = await getGamesForTournamentRound(tournamentId, roundNr);
    return res.json({games});
}

async function endGame(gameId, userId, tournamentId, res) {
    const title = "Error ending game";

    if (!(gameId + ''.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const game = await getGameWithPlayerNames(gameId);
    let tournament = await getTournament(tournamentId);

    if (tournament?.orgaId !== userId && game.player1Id !== userId && game.player2Id !== userId) {
        res.status(403);
        return res.json({title, text: "Only the organizer or participants can end a game"});
    }

    if (await setGameEnded(gameId, true)) {
        if (tournament) {
            let games = await getGamesForTournamentRound(tournamentId, game.roundNr);

            games = games.reduce(function (map, obj) {
                map[obj.id] = obj;
                return map;
            }, {});
            tournament.games = games;

            tournament.players = await getPlayerOverView(tournamentId);
            tournament.canEndRound = await checkCanEndRound(tournament);
            return res.json({tournament});
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function reopenGame(gameId, userId, tournamentId, res) {
    const title = "Error reopening game";

    // TODO: Check if the round finished

    if (!(gameId + ''.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const game = await getGameWithPlayerNames(gameId);
    const tournament = await getTournament(tournamentId);

    if (tournament?.orgaId !== userId && game.player1Id !== userId && game.player2Id !== userId) {
        res.status(403);
        return res.json({title, text: "Only the organizer or participants can reopen a game"});
    }

    if (await setGameEnded(gameId, false)) {
        if (tournament) {
            let games = await getGamesForTournamentRound(tournamentId, game.roundNr);

            games = games.reduce(function (map, obj) {
                map[obj.id] = obj;
                return map;
            }, {});
            tournament.games = games;

            tournament.players = await getPlayerOverView(tournamentId);
            tournament.canEndRound = await checkCanEndRound(tournament);
            return res.json({tournament});
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function updateGameScore(partialGame, userId, tournamentId, res) {
    const title = "Error updating game score";

    if (!(partialGame.id + ''.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    // TODO: Check if the round finished

    let game = await getGameWithPlayerNames(partialGame.id);

    let tournament = null;
    if (tournamentId) tournament = await getTournament(tournamentId);

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

    console.log(game1, game2);
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

    if (game1.player1Id === userIdToSwapFromGame1) {
        game1.player1Id = userIdToSwapFromGame2;
    } else {
        game1.player2Id = userIdToSwapFromGame2;
    }

    if (game2.player1Id === userIdToSwapFromGame2) {
        game2.player1Id = userIdToSwapFromGame1;
    } else {
        game2.player2Id = userIdToSwapFromGame1;
    }

    console.log(game1, game2)

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