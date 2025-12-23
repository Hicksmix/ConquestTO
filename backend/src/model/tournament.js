/**
 * MODEL
 * Tournament
 */
class Tournament {
    id;
    name;
    date;
    endDate;
    maxPlayers;
    country;
    city;
    zip;
    address;
    description;
    externalLink;
    orgaId;
    state;
    players;
    currentRound;
    currentRoundState;
    canEndRound;
    games;

    constructor(id, name, date, endDate, maxPlayers, country, city, zip, address, description, externalLink, orgaId, state, players, currentRound, currentRoundState) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.endDate = endDate;
        this.maxPlayers = maxPlayers;
        this.country = country;
        this.city = city;
        this.zip = zip;
        this.address = address;
        this.description = description;
        this.externalLink = externalLink;
        this.orgaId = orgaId;
        this.state = state;
        this.players = players;
        this.currentRound = currentRound;
        this.currentRoundState = currentRoundState;
    }
}

module.exports = Tournament;