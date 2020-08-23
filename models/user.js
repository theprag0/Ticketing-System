var mongoose=require("mongoose"),
    passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    firstName:String,
    lastName:String
})

userSchema.plugin(passportLocalMongoose);

var User=mongoose.model("User",userSchema);
module.exports=User;