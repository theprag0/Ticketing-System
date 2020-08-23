const User = require("../models/user");

var User=require("../models/user");
var Support=require("../models/support");
var Complaint=require("../models/complaints");
var middlewareObj={};

middlewareObj.isLoggedIn=function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You must be logged in to do that");
    res.redirect("/login");
}

module.exports=middlewareObj;