const {
    createNewTournament,
    getTournament,
    getTournamentsByOrgaId,
    getPlayerOverView, setTournamentState, setCurrentRoundState, setCurrentRound
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
        if (await setCurrentRound(tournamentId, tournament.currentRound + 1) && await setCurrentRoundState(tournamentId, "created")) {
            tournament = await getTournament(tournamentId);

            tournament.games = await createMatchups(tournament);

            if (await createGames(tournament.games)) {
                tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
                tournament.canEndRound = false;
                return res.json(tournament);
            }
        }

        res.status(500);
        return res.json({title, text: "Something went wrong. Please try again later"});
    }
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

    if (tournament.currentRoundState !== "ended") {
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

    if (await checkCanEndRound(tournament) && await setCurrentRoundState(tournamentId, "ended")) {
        tournament = await getTournament(tournamentId);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        tournament.canEndRound = await checkCanEndRound(tournament);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function createNewRound(tournamentId, orgaId, res) {
    const title = "Error creating tournament round";

    if (!(tournamentId?.length > 0) || !(orgaId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    let tournament = await getTournament(tournamentId);

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can create a tournament round"});
    }

    if (tournament.currentRoundState === "ended" && await setCurrentRound(tournamentId, tournament.currentRound + 1) && await setCurrentRoundState(tournamentId, "created")) {
        tournament = await getTournament(tournamentId);

        let games = await createMatchups(tournament);

        if (await createGames(games)) {
            tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
            tournament.canEndRound = false;
            return res.json(tournament);
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function startRound(tournamentId, orgaId, res) {
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

    if (tournament.currentRoundState === "created" && await setCurrentRoundState(tournamentId, "ongoing")) {
        tournament = await getTournament(tournamentId);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        tournament.players = await getPlayerOverView(tournamentId);;

        let p1;
        let p2;
        tournament.games.forEach((game) => {
                p1 = tournament.players.find((p) => p.id === game.player1Id);
                p2 = tournament.players.find((p) => p.id === game.player2Id);
                if (p1 && p2 && p1.TP !== p2.TP) {
                    setHasBeenPairedUpDown(p1.id, tournament.id, true);
                    setHasBeenPairedUpDown(p2.id, tournament.id, true);
                } else if (!p2) {
                    setHasReceivedBye(p1.id, tournament.id, true)
                }
                p1 = null;
                p2 = null;
            }
        );
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function checkCanEndRound(tournament) {
    const currentGames = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
    const hasOngoingGames = currentGames.filter((game) => !game.ended).length > 0;
    return !hasOngoingGames && tournament.state === 'ongoing' && tournament.currentRoundState === "ongoing";
}

async function createMatchups(tournament) {
    let players = await getPlayerOverView(tournament.id);

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
            player.avoid = await getMatchupsToAvoidForTournamentUser(player.id, tournament.id);
        else if (player.teamName) {
            let team = (await getTeam(player.teamName, tournament.id));
            player.avoid = team;
        }
    }

    let games = Swiss(players, tournament.currentRound);

    games = games.map((game) => {
        return [
            game.player1,
            game.player2,
            tournament.id,
            tournament.currentRound,
            0,
            0,
            false,
            null,
            0,
            game.match
        ]
    });

    return games;
}

module.exports = {
    loadTournament,
    createTournament,
    loadTournamentsForOrga,
    addPlayerToTournament,
    removePlayerFromTournament,
    startTournament,
    endTournamentRound,
    createNewRound,
    startRound,
    checkCanEndRound,
    endTournament
}