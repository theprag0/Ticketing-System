var express = require('express');
var router = express.Router({ mergeParams: true });
var Complaint = require('../models/complaints');

// SUPPORT ROUTES
// Show all complaints
router.get('/support', function (req, res) {
    Complaint.find({}, function (err, foundComplaint) {
        if (err) {
            console.log(err);
        } else {
            res.render('support/support', { complaint: foundComplaint });
        }
    });
});

//Show more info about a ticket
router.get('/support/:id', async (req, res) => {
    try {
        const foundComplaint = await Complaint.findById(req.params.id).populate('author.id');
        if (!foundComplaint) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        }
        if (foundComplaint.status === 'pending') {
            foundComplaint.status = 'open';
            foundComplaint.reviewStartedAt = Date.now();
            const startedComplaint = await foundComplaint.save();
            return res.render('support/show', { complaint: startedComplaint });
        }
        res.render('support/show', { complaint: foundComplaint });
    } catch (err) {
        req.flash('error', 'Something went wrong. Please try again');
        return res.redirect('back');
    }
});

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
router.put('/support/:id', async (req, res) => {
    try {
        const foundComplaint = await Complaint.findById(req.params.id).populate('author.id');
        foundComplaint.status = 'resolved';
        const resolvedComplaint = await foundComplaint.save();
        sendVerificartionEmail(resolvedComplaint);
        req.flash('success', 'The user has been notified about the update!');
        return res.redirect('back');
    } catch (err) {
        return main().catch(console.error);
    }
});

module.exports = router;
