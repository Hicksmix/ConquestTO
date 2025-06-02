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

    constructor(id, name, date, orgaId, state, players) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.orgaId = orgaId;
        this.state = state;
        this.players = players;
    }
}

module.exports = Tournament;