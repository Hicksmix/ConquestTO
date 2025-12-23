const {
    createNewTournament,
    getTournament,
    getTournamentsByOrgaId,
    getPlayerOverView, setTournamentState, setCurrentRoundState, setCurrentRound, getTournamentPageCount,
    getTournamentPage, getTournamentsForParticipant, getJoinedTournamentPageCount
} = require("../database/tournament")
const {makeId} = require("../helper/makeId");
const {getUserByMail, getUserByPin, getUser} = require("../database/user");
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
 * @param endDate
 * @param maxPlayers
 * @param country
 * @param city
 * @param zip
 * @param address
 * @param description
 * @param externalLink
 * @param res
 * @returns {Promise<*|null>}
 */
async function createTournament(name, date, orgaId, endDate, maxPlayers, country, city, zip, address, description, externalLink, res) {
    const title = "Error creating tournament";

    if (!(name?.length > 0) || !(date?.length > 0) || !(orgaId?.length > 0) || !(maxPlayers + ''.length > 0)
        || !(country?.length > 0) || !(city?.length > 0) || !(zip + ''.length > 0) || !(address?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const id = makeId(64)

    if (await createNewTournament(id, name, date, orgaId, endDate, maxPlayers, country, city, zip, address, description, externalLink)) {
        return res.json({result: id});
    }
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Lädt eine Turnierübersicht an Turnieren, die der User organisiert hat
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

/**
 * Lädt eine Turnierübersicht an Turnieren, denen der User beigetreten ist
 * @param userId
 * @param pageNr
 * @param res
 * @returns {Promise<*>}
 */
async function loadTournamentsForParticipant(userId, pageNr, res) {
    const title = "Error loading tournaments";

    if (!(userId?.length > 0) || !(pageNr?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }


    const pageCount = await getJoinedTournamentPageCount(userId);

    if (pageNr > pageCount) {
        res.status(400);
        return res.json({title, text: "Page Number exceeds limit"});
    }

    const tournaments = await getTournamentsForParticipant(userId, pageNr);

    // Ergebnisse zurückgeben.
    if (tournaments) {
        return res.json({tournaments, pageCount});
    }

    // Fehler beim Abrufen der Daten.
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Returns the 10 tournaments for a given page number
 * @param pageNr
 * @param filters
 * @param res
 * @returns {Promise<*>}
 */
async function loadTournamentPage(pageNr, filters, res) {
    const title = "Error loading tournaments";

    if (!(pageNr?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const pageCount = await getTournamentPageCount(filters);

    if (pageNr > pageCount) {
        res.status(400);
        return res.json({title, text: "Page Number exceeds limit"});
    }

    const tournaments = await getTournamentPage(pageNr, filters);

    // Ergebnisse zurückgeben.
    if (tournaments) {
        return res.json({tournaments, pageCount});
    }

    // Fehler beim Abrufen der Daten.
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Lädt die Daten eines Turniers
 * @param tournamentId
 * @param res
 * @returns {Promise<*>}
 */
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

/**
 * Fügt einen Spieler anhand seiner pbwPin oder Mail zu einem Turnier hinzu und liefert die neuen Turnierdaten zurück
 * @param pinOrMail
 * @param orgaId
 * @param tournamentId
 * @param faction
 * @param teamName
 * @param res
 * @returns {Promise<*>}
 */
async function addPlayerToTournament(pinOrMail, orgaId, tournamentId, faction, teamName, res) {
    const title = "Error adding player to tournament";

    if (!(tournamentId?.length > 0) || !(pinOrMail?.length > 0) || !(faction?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);

    if (tournament.state !== 'created') {
        res.status(409);
        return res.json({title, text: "Players cannot be added to the tournament once it's started."});
    }

    if (tournament.orgaId !== orgaId) {
        res.status(403);
        return res.json({title, text: "Only the orga can add players."});
    }

    let user = await getUserByPin(pinOrMail);
    if (!user) user = await getUserByMail(pinOrMail); // Falls der User nicht per pbwPin gefunden werden konnte

    // Überprüft, ob das Turnier und der User gefunden wurden und noch Spieler zum Turnier hinzugefügt werden können
    if (tournament && user) {
        tournament.players = await getPlayerOverView(tournamentId);

        if (tournament.maxPlayers <= tournament.players.length) {
            res.status(409);
            return res.json({title, text: "The tournament is already full."});
        }

        // Überprüft, ob der User bereits dem Turnier hinzugefügt wurde
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

/**
 * Allows the user to join a tournament
 * @param userId
 * @param tournamentId
 * @param faction
 * @param teamName
 * @param res
 * @returns {Promise<*>}
 */
async function joinTournament(userId, tournamentId, faction, teamName, res) {
    const title = "Error joining tournament";

    if (!(tournamentId?.length > 0) || !(userId?.length > 0) || !(faction?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);

    if (tournament.state !== 'created') {
        res.status(409);
        return res.json({title, text: "Players cannot join the tournament once it's started."});
    }

    let user = await getUser(userId);

    // Überprüft, ob das Turnier und der User gefunden wurden und noch Spieler zum Turnier hinzugefügt werden können
    if (tournament && user && tournament.state === 'created') {
        tournament.players = await getPlayerOverView(tournamentId);

        if (tournament.maxPlayers <= tournament.players.length) {
            res.status(409);
            return res.json({title, text: "The tournament is already full."});
        }

        // Überprüft, ob der User bereits dem Turnier hinzugefügt wurde
        if (tournament.players.filter(player => player.id === user.id).length > 0) {
            res.status(409);
            return res.json({title, text: "Player already joined tournament"});
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

/**
 * Entfernt einen User aus einem Turnier und liefert die neuen Turnierdaten zurück
 * @param userId
 * @param tournamentId
 * @param res
 * @returns {Promise<*>}
 */
async function removePlayerFromTournament(userId, tournamentId, res) {
    const title = "Error removing player from tournament";

    if (!(tournamentId?.length > 0) || !(userId?.length > 0)) {
        res.status(400);
        return res.json({title, text: "Incomplete data"});
    }

    const tournament = await getTournament(tournamentId);
    let user = await getUser(userId);

    // Überprüft, ob das Turnier und der User gefunden wurden und noch Spieler vom Turnier entfernt werden kann
    if (tournament && user && tournament.state === 'created') {
        const result = await deleteTournamentUser(userId, tournamentId);
        if (result) {
            const tournament = await getTournament(tournamentId);
            if (tournament) {
                tournament.players = await getPlayerOverView(tournamentId);
                return res.json({tournament});
            }
            return res.send();
        }
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Startet ein Turnier, nachdem alle Spieler verwaltet wurden und liefert die neuen Turnierdaten zurück
 * @param tournamentId
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

    // Aktualisieren des TournamentStates
    if (await setTournamentState("ongoing", tournamentId)) {
        // Erstellen der ersten Runde
        if (await setCurrentRound(tournamentId, tournament.currentRound + 1) && await setCurrentRoundState(tournamentId, "created")) {
            tournament = await getTournament(tournamentId);

            // Generiert neue Matchups und erstellt entsprechend die Spiele
            tournament.games = await createMatchups(tournament);

            if (await createGames(tournament.games)) {
                tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
                tournament.canEndRound = false;
                return res.json(tournament);
            }
        }
    }
    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Beendet ein Turnier und liefert die neuen Turnierdaten zurück
 * @param tournamentId
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

/**
 * Beendet die aktuelle Runde eines Turniers und liefert die neuen Turnierdaten zurück
 * @param tournamentId
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

    // Überprüft, ob die Runde beendet werden kann und beendet sie ggf.
    if (await checkCanEndRound(tournament) && await setCurrentRoundState(tournamentId, "ended")) {
        tournament = await getTournament(tournamentId);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        tournament.canEndRound = await checkCanEndRound(tournament);
        return res.json(tournament);
    }

    res.status(500);
    return res.json({title, text: "Something went wrong. Please try again later"});
}

/**
 * Erstellt eine neue Turnierrunde und liefert die neuen Turnierdaten zurück
 * @param tournamentId
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

    // Überprüft, ob die letzte Runde abgeschlossen wurde und alle Daten korrekt aktualisiert wurden
    if (tournament.currentRoundState === "ended" && await setCurrentRound(tournamentId, tournament.currentRound + 1) && await setCurrentRoundState(tournamentId, "created")) {
        tournament = await getTournament(tournamentId);

        // Generieren der Matchups der neuen Runde
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

/**
 * Startet die aktuelle Runde und liefert die neuen Turnierdaten zurück
 * @param tournamentId
 * @param orgaId
 * @param res
 * @returns {Promise<*>}
 */
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

    // Überprüft, ob die Runde gestartet werden kann und startet sie
    if (tournament.currentRoundState === "created" && await setCurrentRoundState(tournamentId, "ongoing")) {
        tournament = await getTournament(tournamentId);
        tournament.games = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
        tournament.players = await getPlayerOverView(tournamentId);

        // Überprüft, ob ein Spieler hoch/runter gepaart wurde, oder ein Bye erhalten hat und setzt entsprechend Flags,
        // um dies für kommende Runden zu vermeiden
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

/**
 * Überprüft, ob die aktuelle Turnierrunde beendet werden kann
 * Dies ist nur möglich, wenn sowohl die aktuelle Runde, als auch das Turnier 'ongoing' sind
 * und alle Spiele der aktuellen Runde beendet wurden
 * @param tournament
 * @returns {Promise<boolean>}
 */
async function checkCanEndRound(tournament) {
    const currentGames = await getGamesForTournamentRound(tournament.id, tournament.currentRound);
    const hasOngoingGames = currentGames.filter((game) => !game.ended).length > 0;
    return !hasOngoingGames && tournament.state === 'ongoing' && tournament.currentRoundState === "ongoing";
}

/**
 * Generiert matchups für eine Turnierrunde anhand des Schweizer Systems
 * @param tournament
 * @returns {Promise<Match[]>}
 */
async function createMatchups(tournament) {
    let players = await getPlayerOverView(tournament.id);

    // Mappen der Spielerdaten, um sie für die Library nutzbar zu machen
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

    // Erstellt für jeden Spieler eine Liste mit Spielern, die für die Paarungen vermieden werden sollen
    for (const player of players) {
        // In Runden nach der ersten, sollen Mitspieler vermieden werden, gegen die der Spieler bereits angetreten ist
        if (tournament.currentRound !== 1)
            player.avoid = await getMatchupsToAvoidForTournamentUser(player.id, tournament.id);
        // In der ersten Turnierrunde sollen Mitspieler aus dem Team des Spielers vermieden werden
        else if (player.teamName) {
            let team = (await getTeam(player.teamName, tournament.id));
            player.avoid = team;
        }
    }

    // Generiert die Paarungen
    let games = Swiss(players, tournament.currentRound);

    // Map, um die Daten für uns verarbeitbar zu machen
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
    loadTournamentPage,
    loadTournament,
    createTournament,
    loadTournamentsForOrga,
    loadTournamentsForParticipant,
    addPlayerToTournament,
    joinTournament,
    removePlayerFromTournament,
    startTournament,
    endTournamentRound,
    createNewRound,
    startRound,
    checkCanEndRound,
    endTournament
}