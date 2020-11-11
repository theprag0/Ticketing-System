require('dotenv').config();
require('./dbConnection');

const express = require('express'),
    app = express(),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    mongoose = require('mongoose'),
    worker = require('worker_threads'),
    engine = require('ejs-mate'),
    moment = require('moment'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    utils = require('./utils/utils'),
    AutoIncrement = require('mongoose-sequence')(mongoose),
    emailServer = require('./utils/sendEmail');

const userRoutes = require('./routes/user'),
    supportRoutes = require('./routes/support'),
    authRoutes = require('./routes/auth'),
    generalRoutes = require('./routes/general'),
    companyRoutes = require('./routes/company');

var Complaint = require('./models/complaints');
var middlewareObj = require('./middleware/index');

require('./worker.js');
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('ejs', engine);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());

// AUTH CONFIG
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: new mongoStore({ mongooseConnection: mongoose.connection }),
        cookie: { maxAge: 86400000 },
    }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

require('moment/min/locales.min');
moment.locale('en');
app.locals.moment = moment;
app.locals.responseTime = utils.responseTime;
app.locals.resolveTime = utils.resolveTime;
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/user', userRoutes);
app.use('/support', supportRoutes);
app.use('/', authRoutes);
app.use('/', generalRoutes);
app.use('/',companyRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log('The Server Has Started.');
});
