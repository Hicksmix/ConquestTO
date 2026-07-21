/**
 * MODEL
 * GameDTO
 */
class GameDTO {
    id;
    player1Id;
    player2Id;
    player1Name;
    player2Name;
    tournamentId;
    roundNr;
    date;
    score1;
    score2;
    ended;
    winnerId;
    tableNr;
    scenario;
    faction1;
    faction2;

    constructor(id, player1Id, player2Id, player1Name, player2Name, tournamentId, roundNr, date, score1, score2, ended, winnerId, tableNr, scenario, faction1, faction2) {
        this.id = id;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.tournamentId = tournamentId;
        this.roundNr = roundNr;
        this.date = date;
        this.score1 = score1;
        this.score2 = score2;
        this.ended = ended;
        this.winnerId = winnerId;
        this.tableNr = tableNr;
        this.scenario = scenario;
        this.faction1 = faction1;
        this.faction2 = faction2;
    }
}

module.exports = GameDTO;