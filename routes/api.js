var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userModel = require('../models/user');
var adminModel = require('../models/admin');
var vendorModel = require('../models/vendor')
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var twilio = require('twilio');
const saltRounds = 10;


var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);

// TODO: Modification of forgot password. Send otp
// router.post('/forgotpassword', (req, res) => {
//
//     var pswd = Math.random().toString(36).substring(7);
//     var hashedPassword = bcrypt.hashSync(pswd, 8);
//     userModel.findOneAndUpdate({ phone: req.body.phone }, { $set: { password: hashedPassword } }, { upsert: false }, (err, account) => {
//         if (account === null)
//             return res.send({msg:"Invalid Phone."});
//
//         var transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_ID,
//                 pass: process.env.PASSWORD
//             }
//         });
//         var mailOptions = {
//             from: process.env.EMAIL_ID,
//             to: req.body.email,
//             subject: 'Login Credentials',
//             text: 'Login Credentials',
//             html: 'Please find your login credentials below: <br /><b>Email: </b>' + req.body.email + '<br /><b>Password: </b><span style="color:blue;">' + pswd + "</span></b>"
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//                 res.send({msg:"There was an error sending email"});
//             } else {
//                 res.send({msg:"Check your mail"});
//             }
//         });
//     });
// });

router.post('/adminsignup',function(req, res, next) {
    adminModel.findOne({"email":req.body.email}, function(error, result) {
        if(result == null){
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                var adminmodel = new adminModel({
                    name:req.body.name,
                    email:req.body.email,
                    password: hash
                });
        
                adminmodel.save(function(err,data) {       
                    if(err){
                        res.status(200).send({auth:false,msg:"server error"});
                    }
                    else{
                        res.status(200).send({auth:true,msg:"success",id:data.id});
                    }
                });
            });
        }
        else{
            res.send({auth:false,msg:"user already exists"})
        }
    });
});

router.post('/adminlogin',function(req, res, next) {
    adminModel.findOne({"email":req.body.email}, function(error, data) {
        if(data != null){
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(result === true){
                    res.status(200).send({auth:true,id:data.id});
                }
                else{
                    res.send({auth:false});
                }
            });
        }
        else{
            res.send({auth:false});
        }
    });
});

router.post('/signup',function(req, res, next) {
    userModel.findOne({"phone":req.body.phone}, function(error, result) {
        if(result == null){
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                var usermodel = new userModel({
                    name:req.body.name,
                    phone:req.body.phone,
                    password: hash,
                    otpAccountVerify: Math.floor(Math.random() * (1111 - 9999)) + 9999
                });
                usermodel.save(function(err,data) {
                    if(err){
                        res.status(500).send({auth:false, msg:"server error"});
                    }
                    else{
                        client.messages.create({
                            body: 'The OTP for the phone number '+data.phone+' is '+data.otpAccountVerify,
                            to: '+91'+data.phone,
                            from: process.env.TWILIO_NUMBER
                        }).then((message) =>  res.status(200).send({auth:true, otp: true ,id:data.id, msg: "OTP has been sent to the given number"}))
                            .catch( (err) =>  res.status(200).send({auth:true, otp: false ,id:data.id, msg:"Unable to send OTP"}))

                    }
                });
            });
        }
        else{
            res.send({auth:false,msg:"user already exists"})
        }
    });
});

// OTP verification functionality
router.post('/otp-verify', function (req, res,next) {
    userModel.findOne({"phone": req.body.phone, "otpAccountVerify": req.body.otp}, function (error, result) {
        if(result == null) {
            res.status(500).send({verification: false, message: 'Invalid OTP'})
        }
        userModel.findOneAndUpdate({phone: result.phone, otpAccountVerify: result.otpAccountVerify},{ $set: {verified: true}},{ upsert: false },(error, account) => {
           if(account == null)
               res.status(500).send({verification: false, message: "Internal Server Error"});
            res.status(200).send({verification: true, message: "Account has been verified", id: account.id});
        });
    })
});

router.post('/login',function(req, res, next) {
    userModel.findOne({"phone":req.body.phone}, function(error, data) {
        if(data != null){
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(result === true){
                    data.verified === false ? res.status(200).send({auth:true, verified: false,id:data.id}) :
                        res.status(200).send({auth:true,verified: true, id:data.id});
                }
                else{
                    res.status(200).send({auth:false});
                }
            });
        }
        else{
            res.send({auth:false});
        }
    });
});

module.exports = router;
