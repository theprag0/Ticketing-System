var express = require('express');
var router = express.Router({ mergeParams: true });
var passport = require('passport');
const User = require('../models/user');
const middlewareObj = require('../middleware/index');

// REGISTER ROUTES
router.get('/register', middlewareObj.notLoggedIn, function (req, res) {
    res.render('auth/register', { page: 'register' });
});

router.post('/register', middlewareObj.notLoggedIn, function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });
    if (req.body.Admincode == 'Perry the platypus is delighted') {
        newUser.role = 'admin';
    } else {
        newUser.role = 'user';
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash('error', 'Something went wrong. Please Try Again.');
            console.log(err);
            res.redirect('back');
        } else {
            passport.authenticate('local')(req, res, function () {
                req.flash(
                    'success',
                    'Thank You for registering with Ticket Cloud ' +
                        user.username +
                        '!',
                );
                res.redirect('/');
            });
        }
    });
});

// LOGIN ROUTES
router.get('/login', middlewareObj.notLoggedIn, function (req, res) {
    res.render('auth/login', { page: 'login' });
});

router.post('/login', middlewareObj.notLoggedIn, function (req, res) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: 'Welcome back, ' + req.body.username + '!',
    })(req, res);
});

//Logout logic
router.get('/logout', middlewareObj.isLoggedIn, (req, res, next) => {
    req.logout();
    req.flash('success', 'Logged you out, Thank you for using Ticket Cloud!');
    res.redirect('/');
});

module.exports = router;
