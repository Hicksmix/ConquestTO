const {
    getGamesForTournamentRound,
    getGameWithPlayerNames,
    setGameEnded,
    updateGame,
    getGame, getGameCountForFactionAndStartToEndDate, getWinCountForFactionAndStartToEndDate,
    getDrawCountForFactionAndStartToEndDate
} = require("../database/game");
const {getTournament, getPlayerOverView, getEndedTournamentsForTimeframe} = require("../database/tournament");
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
 * @param tournamentId
 * @param res
 * @returns {Promise<*>}
 */
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

    if (await setGameEnded(gameId, false)) {
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

    if (!game1Id || !game2Id || !(orgaId?.length > 0)) {
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

    if (tournament.currentRound !== game1.roundNr && tournament.currentRound !== game2.roundNr && tournament.currentRoundState !== "created") {
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

async function loadFactionStatisticsFromStartToEndDate(faction, startDate, endDate, res) {
    const title = "Error Loading Statistics";

    if (!(faction.length > 0) || !(startDate.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    if (!endDate) endDate = (new Date()).toISOString().substring(0, 10);

    const gameCount = Number(await getGameCountForFactionAndStartToEndDate(faction, startDate, endDate));
    const gameWinCount = Number(await getWinCountForFactionAndStartToEndDate(faction, startDate, endDate));

    let tournamentWins = 0;
    let tournamentPodiums = 0;
    const tournaments = await getEndedTournamentsForTimeframe(startDate, endDate);

    if (tournaments) {
        for (const t of tournaments) {
            t.players = await getPlayerOverView(t.id);

            t.players?.slice(0, 3).forEach((p, index) => {
                if (p.faction === faction) tournamentPodiums++;
                if (index === 0 && p.faction === faction) tournamentWins++
            })
        }
    }

    return res.json({gameCount, gameWinCount, tournamentWins, tournamentPodiums});
}

async function loadAllStatisticsFromStartToEndDate(startDate, endDate, res) {
    const title = "Error Loading Statistics";

    if(!startDate) startDate = '2017-11-16'

    const factions = ['100K', 'spires', 'dweghom', 'nords', 'wadrhun', 'old_dominion', 'city_states', 'sorcerer_kings', 'yoroni', 'weaver_courts'];
    let results = [];

    if (!endDate) endDate = (new Date()).toISOString().substring(0, 10);
    const tournaments = await getEndedTournamentsForTimeframe(startDate, endDate);

    if (tournaments) {
        for (const t of tournaments) {
            t.players = await getPlayerOverView(t.id);
        }
    }

    let tournamentWins = 0;
    let tournamentPodiums = 0;
    let tournamentEntries = 0;

    for (let i = 0; i < factions.length; i++) {
        tournamentWins = 0;
        tournamentPodiums = 0;
        tournamentEntries = 0;

        results[i] = {};
        results[i].faction = factions[i];
        results[i].gameCount = Number(await getGameCountForFactionAndStartToEndDate(factions[i], startDate, endDate));
        results[i].gameWinCount = Number(await getWinCountForFactionAndStartToEndDate(factions[i], startDate, endDate));
        results[i].gameDrawCount = Number(await getDrawCountForFactionAndStartToEndDate(factions[i], startDate, endDate));

        tournaments.forEach((t) => {
            t.players?.forEach((p, index) => {
                if (p.faction === factions[i]) {
                    tournamentEntries++;
                    if (index < 3) tournamentPodiums++;
                    if (index === 0) tournamentWins++;
                }
            })
        })

        results[i].tournamentWins = tournamentWins;
        results[i].tournamentPodiums = tournamentPodiums;
        results[i].tournamentEntries = tournamentEntries;
    }

    return res.json(results);
}

module.exports = {
    loadRoundForTournament,
    endGame,
    reopenGame,
    updateGameScore,
    swapPlayers,
    loadFactionStatisticsFromStartToEndDate,
    loadAllStatisticsFromStartToEndDate
}