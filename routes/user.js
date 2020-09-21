var express = require('express');
var router = express.Router({ mergeParams: true });
var Complaint = require('../models/complaints');
const middlewareObj = require('../middleware/index');
const emailServer = require('../utils/sendEmail');
const { findOneAndUpdate } = require('../models/complaints');

// USER ROUTES
// Render the complaint form
router.get('/', middlewareObj.isLoggedIn, function (req, res) {
    res.render('user/user');
});

// Post new complaint
router.post('/', middlewareObj.isLoggedIn, async function (req, res) {
    try {
        const complaint = new Complaint();
        complaint.author = { id: req.user._id };
        complaint.username = req.user.username;
        complaint.name = req.body.name;
        complaint.desc = req.body.desc;
        complaint.type = req.body.type;
        complaint.priority = req.body.priority;
        complaint.status = 'Not Assigned Yet';

        const newComplaint = await complaint.save({ new: true });
        if (!newComplaint) {
            req.flash('error', 'Something went wrong. Please Try Again.');
            return res.redirect('back');
        }

        req.flash('success', 'The Ticket was generated successfully!');
        return res.redirect('/user/req.user.id');
    } catch (err) {
        req.flash('error', 'Something went wrong. Please Try Again.');
        return res.redirect('back');
    }
});

//Access Ticket Panel
router.get('/:id', middlewareObj.isLoggedIn, async (req, res, next) => {
    try {
        const complaints = await Complaint.find({
            archived: false,
            author: { id: req.user._id },
        });
        if (!complaints) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        } else {
            return res.render('user/user-tickets', {
                complaints: complaints,
            });
        }
    } catch (err) {
        req.flash('error', 'Something went wrong. Please try again');
        return res.redirect('back');
    }
});

//Show more info about ticket
router.get('/:id/show', function (req, res) {
    Complaint.findById(req.params.id)
        .populate('author.id assignedTo')
        .exec(function (err, foundComplaint) {
            if (err) {
                req.flash(
                    'error',
                    'Something went wrong, Please try again later.',
                );
                res.redirect('back');
            } else {
                res.render('user/show', { complaint: foundComplaint });
            }
        });
});

// Access history page containing all created tickets
router.get('/:id/history', middlewareObj.isLoggedIn, function (req, res) {
    Complaint.find({ author: { id: req.user._id } })
        .sort('-createdAt')
        .exec(function (err, complaints) {
            if (err) {
                req.flash(
                    'error',
                    'Something went wrong, Please try again later.',
                );
                res.redirect('back');
            }
            res.render('user/user-history', { complaints: complaints });
        });
});

module.exports = router;
