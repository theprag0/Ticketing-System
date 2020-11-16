const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaints');
const emailServer = require('../utils/sendEmail');
const middlewareObj = require('../middleware/index');

// HOME ROUTE
router.get('/', function (req, res) {
    res.render('home', { page: 'home' });
});

// Send Email from Support-Panel
router.post('/email', function (req, res) {
    var newEmail = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
    };
    emailServer.sendSupportEmail(newEmail);
    req.flash('success', 'Email sent successfully!');
    res.redirect('back');
});

// Access history page containing all created tickets
router.get(
    '/support-history/:companyId',
    middlewareObj.isAdmin,
    async function (req, res) {
        try {
            const query = { 'companyId.id': req.params.companyId };
            if (req.query.typeSearch) {
                query.type = new RegExp(
                    escapeRegex(req.query.typeSearch),
                    'gi',
                );
                query.ticketId = req.query.idSearch;
            } else if (req.query.dateSearchStart && req.query.dateSearchEnd) {
                query.startDate = req.query.dateSearchStart;
                query.endDate = req.query.dateSearchEnd;
            }
            if (query.type) {
                const complaints = await Complaint.find(query)
                    .sort('-createdAt')
                    .populate('author.id');
                res.render('support/support-history', {
                    complaints: complaints,
                });
            } else if (query.startDate && query.endDate) {
                const complaints = await Complaint.find({
                    createdAt: {
                        $gte: new Date(query.startDate),
                        $lt: new Date(query.endDate),
                    },
                    'companyId.id': req.user.companyId.id,
                })
                    .sort('-createdAt')
                    .populate('author.id');
                res.render('support/support-history', {
                    complaints: complaints,
                });
            } else {
                const complaints = await Complaint.find({
                    'companyId.id': req.params.companyId,
                })
                    .sort('-createdAt')
                    .populate('author.id');
                res.render('support/support-history', {
                    complaints: complaints,
                });
            }
        } catch (err) {
            console.log(err);
            req.flash('error', 'Something went wrong, Please try again later.');
            res.redirect('back');
        }
    },
);

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
