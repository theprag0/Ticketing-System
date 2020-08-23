var mongoose=require("mongoose");
var User=require("./user");
var complaintSchema=new mongoose.Schema({
    name:String,
    desc:String,
    createdAt:{type:Date,default:Date.now},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String,
        firstName:String,
        lastName:String,
        email:String
    },
    status:String,
    assignedTo:String
},{
    timestamps: true
 });

var Complaint=mongoose.model("Complaint",complaintSchema);
module.exports=Complaint;