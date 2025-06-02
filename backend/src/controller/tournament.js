const { createNewTournament, getTournament, getTournamentsByOrgaId, getPlayerOverView } = require("../database/tournament")
const {makeId} = require("../helper/makeId");
const {response} = require("express");

/**
 * Liefert ein Turnier zurück
 * @param tournamentId
 * @param res
 * @returns {Promise<*|null>}
 */
async function loadTournament(tournamentId, res) {
    const title = "Error loading tournament";

    if (!(tournamentId?.length > 0)) {
        res.status(400);
        return res.json({ title, text: "Incomplete data" });
    }

    const tournament = await getTournament(tournamentId)

    if (!tournament) {
        res.status(404);
        return res.json({ title, text: "Tournament not found" });
    }

    // Ergebnisse zurückgeben.
    if (tournament) {
        return res.json({ tournament });
    }

    // Fehler beim Abrufen der Daten.
    res.status(500);
    return res.json({ title, text: "Something went wrong. Please try again later" });
}
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
        return res.json({ title, text: "Incomplete data" });
    }

    const id = makeId(64)

    if (await createNewTournament(id, name, date, orgaId)) {
        return res.json({ result: id });
    }
    res.status(500);
    return res.json({ title, text: "Something went wrong. Please try again later" });
}

async function loadTournamentsForOrga(orgaId, res) {
    const title = "Error loading tournaments";

    if(!(orgaId?.length > 0)) {
        res.status();
        return res.json({ title, text: "Incomplete data"});
    }

    const tournaments = await getTournamentsByOrgaId(orgaId);

    // Ergebnisse zurückgeben.
    if (tournaments) {
        return res.json({ tournaments });
    }

    // Fehler beim Abrufen der Daten.
    res.status(500);
    return res.json({ title, text: "Something went wrong. Please try again later" });
}

async function loadTournament(tournamentId, res) {
    const title = "Error loading tournament";

    if(!(tournamentId?.length > 0)) {
        res.status();
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);

    if(tournament) {
        tournament.players = await getPlayerOverView(tournamentId);
        return res.json({tournament});
    }

    res.status(500);
    return res.json({ title, text: "Something went wrong. Please try again later" });
}

module.exports = {loadTournament, createTournament, loadTournamentsForOrga}