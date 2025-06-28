/**
 * MODEL
 * TournamentUser
 */
class TournamentUser {
    id;
    username;
    pbwPin;
    email;
    faction;
    winCount;
    lossCount;
    drawCount;
    VP;
    TP;
    SoS;
    pairedUpDown;
    receivedBye;

    constructor(id, username, pbwPin, email, faction, winCount, lossCount, drawCount, VP, TP, SoS, pairedUpDown, receivedBye) {
        this.id = id;
        this.username = username;
        this.pbwPin = pbwPin;
        this.email = email;
        this.faction = faction;
        this.winCount = winCount;
        this.lossCount = lossCount;
        this.drawCount = drawCount;
        this.SoS = SoS;
        this.TP = TP;
        this.VP = VP;
        this.pairedUpDown = pairedUpDown;
        this.receivedBye = receivedBye;
    }
}

module.exports = TournamentUser;