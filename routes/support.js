const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaints');
const User = require('../models/user');
const emailServer = require('../utils/sendEmail');
const middlewareObj = require('../middleware/index');
const utils = require('../utils/utils');
const moment = require('moment');
const Worker = require('worker_threads');

// SUPPORT ROUTES
// Show all complaints
router.get('/', middlewareObj.isAdmin, function (req, res) {
    Complaint.find({ archived: false }, function (err, foundComplaint) {
        if (err) {
            console.log(err);
        } else {
            res.render('support/support', { complaint: foundComplaint });
        }
    });
});

//Show more info about a ticket
router.get('/:id', middlewareObj.isAdmin, function (req, res) {
    Complaint.findById(req.params.id)
        .populate('author.id assignedTo')
        .exec(function (err, foundComplaint) {
            if (err) {
                req.flash('error', 'Something went wrong. Please try again');
                res.redirect('back');
            } else {
                User.find({ role: 'admin' }, function (err, foundAdmin) {
                    if (err) {
                        console.log(err);
                        req.flash(
                            'error',
                            'Something went wrong. Please try again',
                        );
                        res.redirect('back');
                    } else {
                        res.render('support/show', {
                            complaint: foundComplaint,
                            admin: foundAdmin,
                        });
                    }
                });
            }
        });
});

// Add status by updating db
router.put('/:id', middlewareObj.isAdmin, function (req, res) {
    Complaint.findByIdAndUpdate(req.params.id, req.body.form, { new: true })
        .populate('author.id assignedTo')
        .exec(function (err, foundComplaint) {
            if (err) {
                console.log(err);
            } else {
                // SAVE TIMESTAMPS FOR EACH STATUS UPDATE
                if (foundComplaint.status === 'Open') {
                    foundComplaint.reviewStartedAt = Date.now();
                    // Calculate Response Time of Ticket
                    var dateDiff = utils.responseTime(
                        foundComplaint.createdAt,
                        foundComplaint.reviewStartedAt,
                    );
                    foundComplaint.responseTime = dateDiff;
                    foundComplaint.save();
                    // Send mail when ticket is opened
                    emailServer.sendVerificartionEmail(foundComplaint);
                }
                if (foundComplaint.status === 'Pending') {
                    foundComplaint.reviewPendingAt = Date.now();
                    foundComplaint.save();
                }
                if (foundComplaint.status === 'Re-Open') {
                    foundComplaint.reviewReopenAt = Date.now();
                    foundComplaint.save();
                }
                if (foundComplaint.status === 'Closed') {
                    foundComplaint.archivingTime = Date.now() + 86400000;
                    foundComplaint.reviewClosedAt = Date.now();
                    var timeDifference = utils.resolveTime(
                        foundComplaint.reviewStartedAt,
                        foundComplaint.reviewClosedAt,
                        foundComplaint.reviewPendingAt,
                        foundComplaint.reviewReopenAt,
                    );
                    foundComplaint.resolveTime = timeDifference;
                    foundComplaint.save();
                }

                req.flash(
                    'success',
                    'The user has been notified about the update!',
                );
                res.redirect('back');
            }
        });
});
router.post('/email', function (req, res) {
    var newEmail = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
    };
    emailServer.sendNotificationEmail(newEmail);
    res.redirect('back');
});
module.exports = router;
