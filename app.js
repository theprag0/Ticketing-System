require('dotenv').config();
const Complaint = require('./models/complaints'),
    Support = require('./models/support');

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
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

mongoose
    .connect('mongodb://localhost:27017/ticket_system', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());

// AUTH CONFIG
app.use(
    require('express-session')({
        secret: 'He he he',
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
