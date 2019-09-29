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
                        res.status(500).send({msg:"server error"});
                    }
                    else{
                        res.status(200).send({msg:"success"});
                    }
                });
            });
        }
        else{
            res.send({msg:"user already exists"})
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