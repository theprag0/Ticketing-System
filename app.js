require('dotenv').config();
require('./dbConnection');

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user');

var userRoutes = require('./routes/user'),
    supportRoutes = require('./routes/support'),
    authRoutes = require('./routes/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());

// AUTH CONFIG
app.use(
    require('express-session')({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy(Support.authenticate()));
// passport.serializeUser(Support.serializeUser());
// passport.deserializeUser(Support.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use(userRoutes);
app.use(supportRoutes);
app.use(authRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log('The Server Has Started.');
});
