var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userModel = require('../models/user');
var adminModel = require('../models/admin');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const saltRounds = 10;
var jwt = require('jsonwebtoken')

function createToken(user){
    return jwt.sign({
        id: user.id,
        phone: user.email
    }, process.env.jwtSecret, {
        expiresIn: 1000
    }
    )
}

router.post('/forgotpassword', (req, res) => {

    var pswd = Math.random().toString(36).substring(7);
    var hashedPassword = bcrypt.hashSync(pswd, 8);
    userModel.findOneAndUpdate({ email: req.body.email }, { $set: { password: hashedPassword } }, { upsert: false }, (err, account) => {
        if (account === null) 
            return res.send({msg:"Invalid Email."});

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.PASSWORD
            }
        });
        var mailOptions = {
            from: process.env.EMAIL_ID,
            to: req.body.email,
            subject: 'Login Credentials',
            text: 'Login Credentials',
            html: 'Please find your login credentials below: <br /><b>Email: </b>' + req.body.email + '<br /><b>Password: </b><span style="color:blue;">' + pswd + "</span></b>"
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.send({msg:"There was an error sending email"});
            } else {
                res.send({msg:"Check your mail"});
            }
        });
    });
});

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
                        console.log(err)
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
    console.log(req.body);
    adminModel.findOne({"email":req.body.email}, function(error, data) {
        console.log(data);
        // console.log(req.body.password, data.password);
        
        if(data != null){
            console.log(req.body.password, data.password);
            
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
})

router.post('/signup',function(req, res, next) {

    userModel.findOne({"email":req.body.email}, function(error, result) {
        if(result == null){
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                var usermodel = new userModel({
                    name:req.body.name,
                    email:req.body.email,
                    password: hash
                });
        
                usermodel.save(function(err,data) {       
                    if(err){
                        res.status(500).send({auth:false, msg:"server error"});
                    }
                    else{
                        res.status(200).send({auth:true, token:createToken(data), msg:"success"});
                    }
                });
            });
        }
        else{
            res.send({auth:false,msg:"user already exists"})
        }
    });
});

router.post('/login',function(req, res, next) {
    userModel.findOne({"email":req.body.email}, function(error, data) {
        if(data != null){
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(result === true){
                    res.status(200).send({auth:true,token:createToken(data)});
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
})


module.exports = router;