var express=require("express");
var router=express.Router({mergeParams:true});
var passport=require("passport");
var User=require("../models/user");
var Complaint=require("../models/complaints");

// USER ROUTES
// Render the complaint form
router.get("/user",isLoggedIn,function(req,res){
    res.render("user/user");
});
// Post new complaint
router.post("/user",isLoggedIn,function(req,res){
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var name=req.body.name;
    var desc=req.body.desc;
    var newComplaint={author:author,name:name,desc:desc};
    Complaint.create(newComplaint,function(err,complaint){
        if(err){
            req.flash("error","Something went wrong. Please try again");
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You must be logged in to do that");
    res.redirect("/login");
}
module.exports=router;