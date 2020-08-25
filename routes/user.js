var express = require('express');
var router = express.Router({ mergeParams: true });
var Complaint = require('../models/complaints');
const middlewareObj = require('../middleware/index');

// USER ROUTES
// Render the complaint form
router
    .get('/', middlewareObj.isLoggedIn, function (req, res) {
        res.render('user/user');
    })
    // Post new complaint
    .post('/', middlewareObj.isLoggedIn, async (req, res, next) => {
        try {
            const complaint = new Complaint();
            complaint.author = req.user._id;
            complaint.username = req.user.username; // this is bad practice! prefer using only id. no harcoded usernames. if user updates username.
            complaint.name = req.body.name;
            complaint.desc = req.body.desc;
            complaint.status = 'Pending';
            const newComplaint = await complaint.save();
            if (!newComplaint) {
                req.flash('error', 'Something went wrong. Please try again');
                return res.redirect('back');
            }
            req.flash('success', 'new complaint was successfully created!');
            return res.redirect('back');
        } catch (err) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        }
    });

// Get history page with all posted complaints
router.get('/:d', middlewareObj.isLoggedIn, async (req, res, next) => {
    try {
        const complaints = await Complaint.find({ author: req.user._id });
        if (!complaints) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        } else {
            return res.render('user/history', {
                complaints: complaints,
            });
        }
    } catch (err) {
        req.flash('error', 'Something went wrong. Please try again');
        return res.redirect('back');
    }
});

module.exports = router;
