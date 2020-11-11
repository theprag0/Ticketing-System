const fs = require('fs');
const express = require('express');
const passport = require('passport');
const multer = require('multer');
const csv = require('fast-csv');
const upload = multer({dest:'tmp/csv/'});
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const middlewareObj = require('../middleware/index');

// REGISTER ROUTES
// router.get('/register', middlewareObj.notLoggedIn, function (req, res) {
//     res.render('auth/register', { page: 'register' });
// });

// router.post('/register', middlewareObj.notLoggedIn, function (req, res) {
//     var newUser = new User({
//         username: req.body.username,
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//     });
//     if (req.body.Admincode == 'Perry the platypus is delighted') {
//         newUser.role = 'admin';
//     } else {
//         newUser.role = 'user';
//     }
//     User.register(newUser, req.body.password, function (err, user) {
//         if (err) {
//             req.flash('error', 'Something went wrong. Please Try Again.');
//             console.log(err);
//             res.redirect('back');
//         } else {
//             passport.authenticate('local')(req, res, function () {
//                 req.flash(
//                     'success',
//                     'Thank You for registering with Ticket Cloud ' +
//                         user.username +
//                         '!',
//                 );
//                 res.redirect('/');
//             });
//         }
//     });
// });

// REGISTER COMPANY ADMIN
router.get('/register/company',async(req,res)=>{
    res.render('company/signup',{page:'register'});
});

router.post('/register/company',async (req,res)=>{
  const newCompany={
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      username:req.body.username,
      role:'companyAdmin',
  };

  User.register(newCompany,req.body.password,function(err,user){
      if(err){
        req.flash('error','Something went wrong, Please try again later');
        return res.redirect('back');
      }else{
          passport.authenticate('local')(req,res,function(){
           req.flash('success','Just one more step to go');
           return res.redirect('/company/register')
          });
      }
  });
});

// ADD USERS FROM COMPANY DASHBOARD
router.get('/register/user/:companyId',async (req,res)=>{
    try{
        const foundUsers= await User.find({"companyId.id":req.params.companyId});
        return res.render('auth/company-user',{companyId:req.params.companyId,users:foundUsers});
    }catch(err){
        req.flash('error','Something went wrong, Please try again later');
        return res.redirect('back');
    }
 });

//  ADD SUPPORT EXECUTIVES FROM DASHBOARD
router.get('/register/support/:companyId',async (req,res)=>{
   try{
       const foundUsers=await User.find({"companyId.id":req.params.companyId});
       return res.render('auth/company-support',{companyId:req.params.companyId,users:foundUsers});
   }catch(err){
    req.flash('error','Something went wrong, Please try again later');
    return res.redirect('back');
   }
});
 
 router.post('/register/add/:companyId',upload.single('file'),async (req,res)=>{
   try{
    if(req.file){
        let fileRows=[];
        csv.parseFile(req.file.path)
           .on("data", function (data) {
             fileRows.push(data); // push each row
           })
           .on("end",async function () {
           //   console.log(fileRows)
           fs.unlinkSync(req.file.path);   
       
            for(let i=1;i<fileRows.length;i++){
                const newUser={
                    firstName:fileRows[i][0],
                    lastName:fileRows[i][1],
                    username:fileRows[i][2],
                    email:fileRows[i][3],
                    role:req.body.role,
                    companyId:{id:req.params.companyId}
                }
                const user=await User.register(newUser,fileRows[i][4]);
            }
        })
    } else{
        const newUser={
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            role:req.body.role,
            companyId:{id:req.params.companyId},
            username:req.body.username
        };
   
        const user=await User.register(newUser,req.body.password);
    }
    return res.redirect('back');
   }catch(err){
      req.flash('error',err.message);
      res.redirect('back');
   }
 });

// LOGIN ROUTES
router.get('/login', middlewareObj.notLoggedIn, function (req, res) {
    res.render('auth/login', { page: 'login' });
});

router.post('/login', middlewareObj.notLoggedIn, function (req, res) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: 'Welcome back, ' + req.body.username + '!',
    })(req, res);
});

//Logout logic
router.get('/logout', middlewareObj.isLoggedIn, (req, res, next) => {
    req.logout();
    req.flash('success', 'Logged you out, Thank you for using Ticket Cloud!');
    res.redirect('/');
});

module.exports = router;
