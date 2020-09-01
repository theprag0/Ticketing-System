const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaints');
const User = require('../models/user');
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
                if (
                    foundComplaint.status ==
                        ('Open' || 'Pending' || 'Re-Open') &&
                    foundComplaint.assignedTo
                ) {
                    // Set max-hours to resolve ticket
                    if (foundComplaint.priority === 'P-01') {
                        priority(2, foundComplaint);
                    } else if (foundComplaint.priority === 'P-02') {
                        priority(4);
                    } else if (foundComplaint.priority === 'P-03') {
                        priority(8);
                    } else if (foundComplaint.priority === 'P-04') {
                        priority(2 * 24);
                    }
                } else if (foundComplaint.status == 'Closed') {
                    stopFunction();
                }
                req.flash(
                    'success',
                    'The user has been notified about the update!',
                );
                res.redirect('back');
            }
        });
});

var ticketTimer;
function priority(maxHour, complaint) {
    //var maxTime=maxHour*60*60*1000; //Set max-time according to the ticket priority
    //var firstAlert=1*60*60*1000; //Send the first alert after 1 hour from time of creation
    var maxTime = 1 * 60 * 1000;
    var firstAlert = 10 * 1000;
    // Send alert to open new ticket after 1 hour from creation
    // for(i=firstAlert;i<=maxTime;i=i+(10*1000)){

    //        const timer= setTimeout(function(){
    //         if(complaint.status !== "Closed"){
    //         //    emailServer.sendTimeAlertEmail(complaint);
    //         console.log("your time has come");
    //     }else if(complaint.status=='Closed'){
    //         timer.clearTimeout();
    //     }
    //         },i);
    //     }
    for (let i = firstAlert; i <= maxTime; i = i + 10 * 1000) {
        delay(i);
        if (complaint.status == 'Closed') {
            break;
        }
    }

    function delay(i) {
        setTimeout(function () {
            console.log('time limit exceeded!');
        }, i);
    }

    //     for(i=firstAlert;i<=maxTime;i=i+(10*1000)){
    //         if(complaint.status !== "Closed"){
    //          timeOut=setTimeout(function(){
    //             //    emailServer.sendTimeAlertEmail(complaint);
    //             console.log("your time has come");
    //             },i);
    //             if(complaint.status=='Closed'){
    //                 break;
    //                 clearTimeout(timeOut);
    //             }
    //     }
    // }
}
function stopFunction() {
    clearTimeout(ticketTimer);
}
module.exports = router;
