const { createNewTournament, getTournament } = require("../database/tournament")
const {makeId} = require("../helper/makeId");

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

    let tournament = await getTournament(tournamentId)

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

    console.log(name, date, orgaId)
    if (!(name.length > 0) || !(date.length > 0) || !(orgaId.length > 0)) {
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

module.exports = {loadTournament, createTournament}