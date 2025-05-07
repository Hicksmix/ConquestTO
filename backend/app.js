let express = require('express');
let cors = require('cors');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/api.js');

// Konfiguration für CORS
const corsOptions = {
    origin: ['http://localhost:4173', 'http://localhost', 'https://b2.vwprg.proj.mylab.th-luebeck.de'],
    credentials: true, // um Cookies und Authentifizierungsinformationen zu erlauben
    optionsSuccessStatus: 200
};

let app = express();
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);
module.exports = app;