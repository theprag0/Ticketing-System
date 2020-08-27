const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaints');
const emailServer = require('../utils/sendEmail');
const middlewareObj = require('../middleware/index');
const utils = require('../utils/utils');

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
router
    .get('/:id', middlewareObj.isAdmin, async (req, res) => {
        try {
            const foundComplaint = await Complaint.findById(
                req.params.id,
            ).populate('author');
            if (!foundComplaint) {
                req.flash('error', 'Something went wrong. Please try again');
                return res.redirect('back');
            }
            if (foundComplaint.status === 'Pending') {
                foundComplaint.status = 'Open';
                foundComplaint.reviewStartedAt = Date.now();
                const startedComplaint = await foundComplaint.save();
                return res.render('support/show', {
                    complaint: startedComplaint,
                });
            }
            res.render('support/show', { complaint: foundComplaint });
        } catch (err) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        }
    })

    // router.route("/support/:id").get(async(req, res, next) => {
    //     try {
    //     const complaint = await Complaint.findById(req.params.id).populate("author.id");
    //     complaint.status = "Open";
    //     const startedComplaint = await complaint.save();
    //     res.render("support/show",{complaint:startedComplaint});
    //     res.status(200).json({startedComplaint})
    //     } catch(err) {
    //     return next(err);
    //     }
    //     }).put(async(req, res, next) => {
    //     try {
    //     const complaint = await Complaint.findById(req.params.id).populate("author.id");
    //     complaint.status = "Closed";
    //     const startedComplaint = await complaint.save();
    //     res.render("support/show",{complaint:startedComplaint});
    //     res.status(200).json({startedComplaint})
    //     } catch(err) {
    //     return next(err);
    //     }
    //     });

    // Add status by updating db
    .put('/:id', middlewareObj.isAdmin, async (req, res) => {
        try {
            const foundComplaint = await Complaint.findById(
                req.params.id,
            ).populate('author');
            foundComplaint.status = 'Close';
            foundComplaint.archivingTime = Date.now() + 86400000; // 24 hours
            const resolvedComplaint = await foundComplaint.save();
            emailServer.sendVerificartionEmail(resolvedComplaint);
            req.flash(
                'success',
                'The user has been notified about the update!',
            );
            return res.redirect('back');
        } catch (err) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        }
    });

module.exports = router;
