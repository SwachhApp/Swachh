var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userModel = require('../models/user');
var bcrypt = require('bcrypt');

const saltRounds = 10;

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
                        res.send("error");
                    }
                    else{
                        res.send("success");
                    }
                });
            });
        }
        else{
            res.send("user already exists")
        }
    });
});

router.post('/login',function(req, res, next) {
    userModel.findOne({"email":req.body.email}, function(error, data) {
        if(data != null){
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(result === true){
                    res.send("login successful");
                }
                else{
                    res.send("incorrect password");
                }
            });
        }
        else{
            res.send("no user found");
        }
    });
})


module.exports = router;