/**
 * MODEL
 * Tournament
 */
class Tournament {
    id;
    name;
    date;
    orgaId;
    ended;

    constructor(id, name, date, orgaId, ended) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.orgaId = orgaId;
        this.ended = ended
    }
}

module.exports = Tournament;