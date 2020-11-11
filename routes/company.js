const express = require('express');
const router = express.Router({mergeParams:true});
const Company = require('../models/company');
const Complaint = require('../models/complaints');
const User = require('../models/user');
const middlewareObj = require('../middleware/index');

// Create new company
router.get('/company/register',middlewareObj.isCompanyAdmin,async(req,res)=>{
   res.render('company/new',{user:req.user,page:'register'});
});

router.post('/company/register',middlewareObj.isCompanyAdmin,async(req,res)=>{
 try{
     
     const company=new Company();
     company.name=req.body.name;
     company.type=req.body.type;
     company.admin={id:req.user._id};
   
     const newCompany= await company.save({new:true});

     const user=await User.findByIdAndUpdate({_id:req.user._id},{companyId:{id:newCompany.id}});
     req.flash('success','Added company successfully!');
     return res.redirect(`/company/${newCompany._id}`);
 }catch(err){
    req.flash('error','Something went wrong, Please try again later.');
    res.redirect('/');
 }   
});

// Show company dashboard
router.get('/company/:id',middlewareObj.isCompanyAdmin,async (req,res)=>{
  try{
     const foundCompany=await Company.findById({_id:req.params.id}).populate('admin.id');
     const complaints = await Complaint.find({"companyId.id":req.params.id});
     return res.render('company/company-panel',{company:foundCompany, complaints:complaints});
  }catch(err){
     req.flash('error','Something went wrong, Please try again later.');
     return res.redirect('/');
  }
});

module.exports = router;