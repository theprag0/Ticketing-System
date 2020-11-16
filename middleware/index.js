const User = require('../models/user');
const Complaint = require('../models/complaints');
let middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You must be logged in to do that');
    res.redirect('/login');
};

middlewareObj.isAdmin = (req, res, next) => {
    if (
        (req.isAuthenticated() && req.user.role === 'admin') ||
        req.user.role === 'companyAdmin'
    ) {
        return next();
    } else {
        req.flash('error', 'You are not allowed to view this page!');
        return res.redirect('back');
    }
};

middlewareObj.notLoggedIn = (req, res, next) => {
    if (req.user) {
        req.flash('error', 'You are already logged in to the application!');
        res.redirect('back');
        return;
    } else {
        next();
    }
};

middlewareObj.isCompanyAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'companyAdmin') {
        return next();
    } else {
        req.flash('error', 'You are not allowed to view this page!');
        return res.redirect('back');
    }
};

middlewareObj.isUser = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'user') {
        return next();
    } else {
        req.flash('error', 'You are not allowed to view this page!');
        return res.redirect('back');
    }
};

module.exports = middlewareObj;
