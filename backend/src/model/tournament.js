/**
 * MODEL
 * Tournament
 */
class Tournament {
    id;
    name;
    date;
    orgaId;

    constructor(id, name, date, orgaId) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.orgaId = orgaId;
    }
}

module.exports = Tournament;