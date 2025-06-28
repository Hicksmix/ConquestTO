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
    currentRoundFinished;
    canEndRound;

    constructor(id, name, date, orgaId, state, players, currentRound, currentRoundFinished) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.orgaId = orgaId;
        this.state = state;
        this.players = players;
        this.currentRound = currentRound;
        this.currentRoundFinished = currentRoundFinished;
    }
}

module.exports = Tournament;