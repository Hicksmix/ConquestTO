/**
 * ROUTEN
 *
 * Definiert die Routen für den URI api/*
 */
let express = require('express');
const { verify } = require("jsonwebtoken");
const { login, register} = require("../src/controller/user")
let router = express.Router();

router.post('/user/login', async function(req, res){
    await login(req.body.email, req.body.password, res);
});
router.put('/user/register', async function(req, res){
    await register(req.body.username, req.body.password, req.body.email, req.body.pbw_pin, res)
});

module.exports = router;