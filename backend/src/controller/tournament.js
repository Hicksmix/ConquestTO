const {
    createNewTournament,
    getTournament,
    getTournamentsByOrgaId,
    getPlayerOverView,
    createTournamentUser, deleteTournamentUser, setTournamentState
} = require("../database/tournament")
const {makeId} = require("../helper/makeId");
const {getUserByMail, getUserByPin} = require("../database/user");

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
        return res.json({tournament});
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

async function addPlayerToTournament(pinOrMail, tournamentId, faction, res) {
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

        const result = await createTournamentUser(user.id, tournamentId, faction);

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
        if(tournament) {
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

module.exports = {
    loadTournament,
    createTournament,
    loadTournamentsForOrga,
    addPlayerToTournament,
    removePlayerFromTournament,
    startTournament
}