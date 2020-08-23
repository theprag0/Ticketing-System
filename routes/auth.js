var express=require("express");
var router=express.Router({mergeParams:true});
var passport=require("passport");
const User = require("../models/user");

// HOME ROUTE
router.get("/",function(req,res){
    res.render("home");
});

// REGISTER ROUTES
router.get("/register",function(req,res){
   res.render("auth/register");
});

router.post("/register",function(req,res){
    var newUser=new User({
        username:req.body.username,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email
    });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error","Something went wrong. Please Try Again.")
            console.log(err);
            res.redirect("back");
        }else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Thank You for registering to the Ticketing System "+user.username+"!");
                res.redirect("/");
            });
        }
    });
});

// LOGIN ROUTES
router.get("/login",function(req,res){
    res.render("auth/login");
});

router.post("/login",function(req,res){
    passport.authenticate("local",
    {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome back, " + req.body.username + "!"
    })(req, res);
});

module.exports=router;