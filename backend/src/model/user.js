/**
 * MODEL
 * User
 */
class User {
    id;
    username;
    password;
    email;
    pbw_pin;

    constructor(id, username, password, email, pbw_pin) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.pbw_pin = pbw_pin;
    }
}

module.exports = User;