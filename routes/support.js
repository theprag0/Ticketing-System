require('dotenv').config()
var express=require("express");
var router=express.Router({mergeParams:true});
var passport=require("passport");
var Complaint=require("../models/complaints");
var Support=require("../models/support");
var User=require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
// SUPPORT ROUTES
// Show all complaints
router.get("/support",function(req,res){
    Complaint.find({},function(err,foundComplaint){
       if(err){
           console.log(err);
       }else{
        res.render("support/support",{complaint:foundComplaint});
       }
    });
});

//Show more info about a ticket
router.get("/support/:id",function(req,res){
    Complaint.findById(req.params.id).populate("author.id").exec(function(err,foundComplaint){
        if(err){
            req.flash("error","Something went wrong. Please try again");
            res.redirect("back");
        }else{
            res.render("support/show",{complaint:foundComplaint});
        }
    });
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
router.put("/support/:id",function(req,res){
    var status=req.body.status;
    var assignedTo=req.body.assignedTo;
    var updatedComplaint={status:status,assignedTo:assignedTo,timeEntered:Date.now()};
    Complaint.findByIdAndUpdate(req.params.id,updatedComplaint,{new:true}).populate("author.id").exec(function(err,foundComplaint){
        if(err){
            console.log(err);
        }else{
            if(foundComplaint.status=="Open"){
              async function main(){
                let transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                      user: "pragwebdev@gmail.com", // generated ethereal user
                      pass: process.env.GMAILPW, // generated ethereal password
                    }
                  });
                  let info = await transporter.sendMail({
                    from: "pragwebdev@gmail.com", // sender address
                    to: foundComplaint.author.id.email, // list of receivers
                    subject: "Your Ticket Has Been Initiated", // Subject line
                    text: "Hi "+foundComplaint.author.id.username+",\n\n"+
                            "Thank You For Using Our Ticketing System.\n"+
                            "This is a confirmation email to notify you that your ticket with ref. no:"
                            +foundComplaint.id+" has been initiated by our support team successfully.\n"+
                            "Stay tuned for further updates\n\n."+
                            "With Regards,\n"+
                            "Admin,\nSupport Team" // plain text body
                  });
               }
               main().catch(console.error);
            }
            req.flash("success","The user has been notified about the update!");
            res.redirect("back");
        }
    });
});

module.exports=router;