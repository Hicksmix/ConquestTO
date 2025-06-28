const {getGamesForTournamentRound, getGameWithPlayerNames, setGameEnded, updateGame} = require("../database/game");
const {getTournament, getPlayerOverView} = require("../database/tournament");
const {checkCanEndRound} = require("./tournament");

async function loadRoundForTournament(tournamentId, roundNr, res) {
    const title = "Error loading tournament round";

    if (!(tournamentId?.length > 0) || !(roundNr?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }
    let games = await getGamesForTournamentRound(tournamentId, roundNr);
    games = games.reduce(function (map, obj) {
        map[obj.id] = obj;
        return map;
    }, {});
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

async function updateGamePartial(partialGame, userId, tournamentId, res) {
    const title = "Error updating game";

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

module.exports = {
    loadRoundForTournament, endGame, reopenGame, updateGamePartial
}