const express = require('express');
const router = express.Router({ mergeParams: true });
const Complaint = require('../models/complaints');
const Company = require('../models/company');
const middlewareObj = require('../middleware/index');
const emailServer = require('../utils/sendEmail');

// USER ROUTES
// Render the  complaint form
router.get('/create/:companyId', middlewareObj.isLoggedIn, function (req, res) {
    res.render('user/user',{companyId:req.params.companyId});
});

// Post new complaint
router.post('/create/:companyId', middlewareObj.isLoggedIn, async function (req, res) {
    try {
        const complaint = new Complaint();
        complaint.author = { id: req.user._id };
        complaint.username = req.user.username;
        complaint.name = req.body.name;
        complaint.desc = req.body.desc;
        complaint.type = req.body.type;
        complaint.priority = req.body.priority;
        complaint.status = 'Not Assigned Yet';
        complaint.companyId = {id:req.params.companyId};

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
router.get('/:id', middlewareObj.isUser, middlewareObj.isLoggedIn, async (req, res, next) => {
    try {
        let perPage = 6;
        let pageQuery = parseInt(req.query.page);
        let pageNumber = pageQuery ? pageQuery : 1;

        const complaints = await Complaint.find({
            archived: false,
            author: { id: req.user._id },
        })
            .skip(perPage * pageNumber - perPage)
            .limit(perPage)
            .sort('-createdAt');
        let count = await Complaint.countDocuments({
            archived: false,
            author: { id: req.user._id },
        });

        const company=await Company.findById({_id:req.user.companyId.id});
       
        if (!complaints) {
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('back');
        } else {
            return res.render('user/user-tickets', {
                complaints: complaints,
                pages: Math.ceil(count / perPage),
                current: pageNumber,
                companyId:req.user.companyId.id,
                company:company
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
router.get('/:id/history', middlewareObj.isUser, middlewareObj.isLoggedIn, async function (req, res) {
    try {
        const query = { author: { id: req.user._id }, "companyId.id":req.user.companyId.id };
        if (req.query.typeSearch) {
            query.type = new RegExp(escapeRegex(req.query.typeSearch), 'gi');
            query.ticketId = req.query.idSearch;
        } else if (req.query.dateSearchStart && req.query.dateSearchEnd) {
            query.startDate = req.query.dateSearchStart;
            query.endDate = req.query.dateSearchEnd;
        }
        if (query.type) {
            const complaints = await Complaint.find(query)
                .sort('-createdAt')
                .populate('author.id');
            res.render('user/user-history', { complaints: complaints });
        } else if (query.startDate && query.endDate) {
            const complaints = await Complaint.find({
                author: { id: req.user._id },
                "companyId.id":req.user.companyId.id,
                createdAt: {
                    $gte: new Date(query.startDate),
                    $lt: new Date(query.endDate),
                },
            })
                .sort('-createdAt')
                .populate('author.id');
            console.log(complaints);
            res.render('user/user-history', { complaints: complaints });
        } else {
            const complaints = await Complaint.find({
                author: { id: req.user._id },
                "companyId.id":req.user.companyId.id
            })
                .sort('-createdAt')
                .populate('author.id');
            res.render('user/user-history', { complaints: complaints });
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Something went wrong, Please try again later.');
        res.redirect('back');
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
