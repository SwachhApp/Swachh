var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userModel = require('../models/user');
var adminModel = require('../models/admin');
var bcrypt = require('bcrypt');

const saltRounds = 10;

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
                        res.status(200).send({auth:true, id:data.id, msg:"success"});
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


module.exports = router;