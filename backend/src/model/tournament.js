/**
 * MODEL
 * Tournament
 */
class Tournament {
    id;
    name;
    date;
    orgaId;
    state;
    players;
    currentRound;
    currentRoundState;
    canEndRound;
    games;

    constructor(id, name, date, orgaId, state, players, currentRound, currentRoundState) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.orgaId = orgaId;
        this.state = state;
        this.players = players;
        this.currentRound = currentRound;
        this.currentRoundState = currentRoundState;
    }
}

module.exports = Tournament;