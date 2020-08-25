const User = require('../models/user');
var Support = require('../models/support');
var Complaint = require('../models/complaints');
var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You must be logged in to do that');
    res.redirect('/login');
};

middlewareObj.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    } else {
        req.flash('error', 'You are not allowed to view this page!');
        return res.redirect('back');
    }
};

module.exports = middlewareObj;
