/**
 * MODEL
 * User
 */
class User {
    id;
    username;
    password;
    email;
    pbwPin;

    constructor(id, username, password, email, pbwPin) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.pbwPin = pbwPin;
    }
}

module.exports = User;