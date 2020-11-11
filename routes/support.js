const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaints');
const User = require('../models/user');
const Company = require('../models/company');
const emailServer = require('../utils/sendEmail');
const middlewareObj = require('../middleware/index');
const utils = require('../utils/utils');
const moment = require('moment');

// SUPPORT ROUTES
// Show all complaints
router.get('/:companyId', middlewareObj.isAdmin, async (req, res, next) => {
    try {
        let perPage = 6;
        let pageQuery = parseInt(req.query.page);
        let pageNumber = pageQuery ? pageQuery : 1;

        const complaints = await Complaint.find({ archived: false ,"companyId.id":req.params.companyId})
            .skip(perPage * pageNumber - perPage)
            .limit(perPage)
            .sort('-createdAt');
        let countAll = await Complaint.countDocuments({ archived: false,"companyId.id":req.params.companyId });

        const recentComplaints = await Complaint.find({
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            "companyId.id":req.params.companyId
        }).sort('-createdAt');
        let countRecent = await Complaint.countDocuments({
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            "companyId.id":req.params.companyId
        });

        const company=await Company.findById({_id:req.params.companyId});
        
        return res.render('support/support', {
            complaints: complaints,
            recentComplaints: recentComplaints,
            current: pageNumber,
            allPages: Math.ceil(countAll / perPage),
            recentPages: Math.ceil(countRecent / perPage),
            company:company
        });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

//Show more info about a ticket
router.get('/show/:id', middlewareObj.isAdmin,async function (req, res) {
  try{
      const complaint = await Complaint.findById(req.params.id).populate('author.id assignedTo');
      const users = await User.find({"companyId.id":complaint.companyId.id,role:{$in:['admin','companyAdmin']}});
      res.render('support/show', {complaint:complaint,admin:users})
  }
  catch(err){
    req.flash('error', 'Something went wrong. Please try again');
    res.redirect('back');
  }
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
                    emailServer.sendClosedEmail(foundComplaint);
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

module.exports = router;
