const {
    createNewTournament,
    getTournament,
    getTournamentsByOrgaId,
    getPlayerOverView, setTournamentState, setCurrentRoundFinished, setCurrentRound
} = require("../database/tournament")
const {makeId} = require("../helper/makeId");
const {getUserByMail, getUserByPin} = require("../database/user");
const {getGamesForTournamentRound, createGames, getMatchupsToAvoidForTournamentUser} = require("../database/game");
const {Swiss} = require("tournament-pairings");
const {
    createTournamentUser,
    deleteTournamentUser,
    setHasReceivedBye,
    setHasBeenPairedUpDown, getTeam
} = require("../database/tournament-user");


/**
 * Erstellt ein neues Turnier
 * @param name
 * @param date
 * @param orgaId
 * @param res
 * @returns {Promise<*|null>}
 */
async function createTournament(name, date, orgaId, res) {
    const title = "Error creating tournament";

    if (!(name?.length > 0) || !(date?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const id = makeId(64)

    if (await createNewTournament(id, name, date, orgaId)) {
        return res.json({result: id});
    }
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function loadTournamentsForOrga(orgaId, res) {
    const title = "Error loading tournaments";

    if (!(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournaments = await getTournamentsByOrgaId(orgaId);

    // Ergebnisse zurückgeben.
    if (tournaments) {
        return res.json({tournaments});
    }

    // Fehler beim Abrufen der Daten.
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function loadTournament(tournamentId, res) {
    const title = "Error loading tournament";

    if (!(tournamentId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);

    if (tournament) {
        tournament.players = await getPlayerOverView(tournamentId);
        tournament.canEndRound = await checkCanEndRound(tournament);
        return res.json({tournament});
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function addPlayerToTournament(pinOrMail, tournamentId, faction, teamName, res) {
    const title = "Error adding player to tournament";

    if (!(tournamentId?.length > 0) || !(pinOrMail?.length > 0) || !(faction?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);
    let user = await getUserByPin(pinOrMail);
    if (!user) user = await getUserByMail(pinOrMail);

    if (tournament && user && tournament.state === 'created') {
        await setCurrentRoundFinished(tournamentId, true);

        tournament.players = await getPlayerOverView(tournamentId);
        if (tournament.players.filter(player => player.id === user.id).length > 0) {
            res.status(409);
            return res.json({title, text: "Player already added to tournament"});
        }

        const result = await createTournamentUser(user.id, tournamentId, faction, teamName);

        if (result) {
            tournament.players = await getPlayerOverView(tournamentId);
            return res.json({tournament});
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function removePlayerFromTournament(userId, tournamentId, res) {
    const title = "Error removing player from tournament";

    if (!(tournamentId?.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const result = await deleteTournamentUser(userId, tournamentId);
    if (result) {
        const tournament = await getTournament(tournamentId);
        if (tournament) {
            tournament.players = await getPlayerOverView(tournamentId);
            return res.json({tournament});
        }
        return res.send();
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function startTournament(tournamentId, orgaId, res) {
    const title = "Error starting tournament";

    if (!(tournamentId?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let tournament = await getTournament(tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can start a tournament"});
    }

    if (await setTournamentState("ongoing", tournamentId)) {
        tournament = await getTournament(tournamentId);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function endTournament(tournamentId, orgaId, res) {
    const title = "Error ending tournament";

    if (!(tournamentId?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let tournament = await getTournament(tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can end a tournament"});
    }

    if (!tournament.currentRoundFinished) {
        res.status(403);
        return res.json({title, text: "You cannot end a tournament while a round is still going on"});
    }

    if (await setTournamentState("ended", tournamentId)) {
        tournament = await getTournament(tournamentId);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function endTournamentRound(tournamentId, orgaId, res) {
    const title = "Error ending tournament round";

    if (!(tournamentId?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let tournament = await getTournament(tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can end a tournament round"});
    }

    if (await checkCanEndRound(tournament) && await setCurrentRoundFinished(tournamentId, true)) {
        tournament = await getTournament(tournamentId);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        tournament.canEndRound = await checkCanEndRound(tournament);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function startNewRound(tournamentId, orgaId, res) {
    const title = "Error starting tournament round";

    if (!(tournamentId?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let tournament = await getTournament(tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can start a tournament round"});
    }

    if (tournament.currentRoundFinished && await setCurrentRound(tournamentId, tournament.currentRound + 1) && await setCurrentRoundFinished(tournamentId, false)) {
        tournament = await getTournament(tournamentId);

        let players = await getPlayerOverView(tournamentId);

        players = players.map((player) => {
            return {
                id: player.id,
                score: player.TP + (player.SoS / 10),
                pairedUpDown: player.pairedUpDown,
                receivedBye: player.receivedBye,
                TP: player.TP,
                teamName: player.teamName,
            };
        });

        for (const player of players) {
            if (tournament.currentRound !== 1)
                player.avoid = await getMatchupsToAvoidForTournamentUser(player.id, tournamentId);
            else if (player.teamName) {
                let team = (await getTeam(player.teamName, tournamentId));
                player.avoid = team;
            }
        }

        let games = Swiss(players, tournament.currentRound);

        games.filter((game) => !game.player2).forEach((g) => setHasReceivedBye(g.player1, tournamentId, true));

        let p1;
        let p2;
        games.forEach((game) => {
                p1 = players.find((p) => p.id === game.player1);
                p2 = players.find((p) => p.id === game.player2);
                if (p1.TP !== p2.TP) {
                    setHasBeenPairedUpDown(p1.id, tournamentId, true);
                    setHasBeenPairedUpDown(p2.id, tournamentId, true);
                }
                p1 = null;
                p2 = null;
            }
        )

        games = games.map((game) => {
            return [
                game.player1,
                game.player2,
                tournamentId,
                tournament.currentRound,
                0,
                0,
                false,
                null,
                0,
                game.match
            ]
        })

        if (await createGames(games)) {
            tournament = await getTournament(tournamentId);
            tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
            tournament.canEndRound = await checkCanEndRound(tournament);
            return res.json(tournament);
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function checkCanEndRound(tournament) {
    const currentGames = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
    const hasOngoingGames = currentGames.filter((game) => !game.ended).length > 0;
    return !hasOngoingGames && tournament.state === 'ongoing' && !tournament.currentRoundFinished;
}

module.exports = {
    loadTournament,
    createTournament,
    loadTournamentsForOrga,
    addPlayerToTournament,
    removePlayerFromTournament,
    startTournament,
    endTournamentRound,
    startNewRound,
    checkCanEndRound,
    endTournament
}