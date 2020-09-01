var express = require('express');
var router = express.Router({ mergeParams: true });
var Complaint = require('../models/complaints');
const middlewareObj = require('../middleware/index');
const emailServer = require('../utils/sendEmail');

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
        notSeen(newComplaint);

        req.flash('success', 'The Ticket was generated successfully!');
        return res.redirect('/');
    } catch (err) {
        req.flash('error', 'Something went wrong. Please Try Again.');
        return res.redirect('back');
    }
});

// Get history page with all posted complaints
// router.get('/:id', middlewareObj.isLoggedIn, async (req, res, next) => {
//     try {
//         const complaints = await Complaint.find({
//             archived: false,
//             author: req.user._id,
//         });
//         if (!complaints) {
//             req.flash('error', 'Something went wrong. Please try again');
//             return res.redirect('back');
//         } else {
//             return res.render('user/history', {
//                 complaints: complaints,
//             });
//         }
//     } catch (err) {
//         req.flash('error', 'Something went wrong. Please try again');
//         return res.redirect('back');
//     }
// });

function notSeen(complaint) {
    var firstAlert = 10 * 1000;
    //Send alert to open new ticket after 1 hour from creation
    setTimeout(function () {
        if (complaint.status === 'Not Assigned Yet') {
            console.log('You have a pending ticket');
        }
    }, firstAlert);
}

module.exports = router;
