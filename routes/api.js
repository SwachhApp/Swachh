var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userModel = require('../models/user');
var adminModel = require('../models/admin');
var vendorModel = require('../models/vendor');
var ordersModel = require('../models/orders');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var twilio = require('twilio');
const saltRounds = 10;

/**
 * TODO: Forgot password Admin
 * TODO: Forgot password vendor
 * TODO: User dashboard data api
 * TODO: Admin Dashboard Data API
 * TODO: Place a garbage collection order
 * TODO: Assign garbage collection to a perticular vendor
 * TODO: vendor accepting order
 * TODO: Create Admin(API)
 * TODO: Create Super Admin(API)
 * TODO: Create Vendor(API)
 */

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);

// Create General Admin API
router.post('admin/create', (req, res, next) => {
    var adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword !== req.body.adminPassword)
        return res.status(400).send({register: false, message: 'Password doesnot match'});
    if (!req.body.name)
        return res.status(500).send({register: false, message: 'Admin name required'});
    if (!req.body.email)
        return res.status(500).send({register: false, message: 'Admin email required'});
    if (!req.body.password)
        return res.status(500).send({register: false, message: 'Admin password required'});
    adminModel.findOne({email: req.body.email}, (err, account) => {
        if (account === null)
            return res.status(500).send({register: false, message: 'Admin email is exsisted'})
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            var admin = new adminModel({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            admin.save(function (err, body) {
                if (err) {
                    return res.status(500).send({register: false, message: "Server error"});
                } else {
                    return res.status(200).send({register: true, message: 'Admin added successfully'});
                }
            })
        });
    });

});

// Create Super admin Admin API
router.post('superAdmin/create', (req, res, next) => {
    var adminPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (adminPassword !== req.body.adminPassword)
        return res.status(400).send({register: false, message: 'Password doesnot match'});
    if (!req.body.name)
        return res.status(500).send({register: false, message: 'Admin name required'});
    if (!req.body.email)
        return res.status(500).send({register: false, message: 'Admin email required'});
    if (!req.body.password)
        return res.status(500).send({register: false, message: 'Admin password required'});
    adminModel.findOne({email: req.body.email}, (err, account) => {
        if (account === null)
            return res.status(500).send({register: false, message: 'Admin email is exsisted'})
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            var admin = new adminModel({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                superAdmin: true
            });
            admin.save(function (err, body) {
                console.log(err);
                console.log(body);
                if (err) {
                    return res.status(500).send({register: false, message: "Server error"});
                } else {
                    return res.status(200).send({register: true, message: 'Admin added successfully'});
                }
            })
        });
    });
});

// TODO: AUTH Doesnot required
router.post('/forgotpassword', (req, res) => {
    let otp = Math.floor(Math.random() * (9999 - 1111)) + 1111;
    userModel.findOneAndUpdate({phone: req.body.phone}, {$set: {otpForgotPassword: otp}}, {upsert: false}, (err, account) => {
        if (account === null)
            return res.send({msg: "Invalid Phone."});
        client.messages.create({
            body: 'The OTP for the phone number ' + account.phone + ' is ' + account.otpForgotPassword,
            to: '+91' + account.phone,
            from: process.env.TWILIO_NUMBER
        }).then((message) => {
            return res.status(200).send({otp: true, id: account.id, msg: "OTP has been sent to the given number"})
        })
            .catch((err) => {
                return res.status(200).send({otp: false, id: account.id, msg: "Unable to send OTP"})
            })
    });
});

// TODO: AUTH doesnot required
router.post('/forgotPassword/change', function (req, res) {
    userModel.findOne({phone: req.body.phone, otpForgotPassword: req.body.otp}, function (err, data) {
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(500).send({
                changePassword: false,
                message: 'Password and confirm password should be same'
            });
        }
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            userModel.findOneAndUpdate({phone: req.body.phone}, {$set: {password: hash}}, {upsert: false}, (err, account) => {
                if (account === null)
                    return res.status(500).send({changePassword: false, message: "Password Change Unsuccessful"});
                return res.status(200).send({changePassword: true, message: "Password has been changed"});
            });
        })
    })
});

// TODO: AUTH Required
router.post('/user/changePassword', (req, res) => {
    userModel.findById(req.body.id, (error, data) => {
        if (data === null)
            return res.status(500).send({changePassword: false, message: "Not able to find the account"});
        bcrypt.compare(req.body.password, data.password, function (err, data) {
            if (data !== null) {
                if (req.body.newPassword !== req.body.confirmPassword)
                    return res.status(500).send({
                        changePassword: false,
                        message: "Password and confirm password doesnot match"
                    });
                bcrypt.hash(req.body.newPassword, saltRounds, function (err, hash) {
                    userModel.findByIdAndUpdate(req.body.id, {$set: {password: hash}}, {upsert: false}, (err, account) => {
                        if (account === null)
                            return res.status(500).send({
                                changePassword: false,
                                message: "Server Error password cannot be changed"
                            });
                        return res.status(200).send({changePassword: true, message: "Password changed successfully"})
                    });

                });
            } else {
                return res.status(500).send({changePassword: false, message: "Current password in correct"})
            }
        });

    })

});

// TODO: AUTH doesnot required
router.post('/adminlogin', function (req, res, next) {
    adminModel.findOne({"email": req.body.email}, function (error, data) {
        if (data != null) {
            bcrypt.compare(req.body.password, data.password, function (err, result) {
                if (result === true) {
                    return res.status(200).send({auth: true, id: data.id});
                } else {
                    return res.send({auth: false});
                }
            });
        } else {
            return res.send({auth: false});
        }
    });
});

// TODO: AUTH Doesnot required
router.post('/signup', function (req, res, next) {
    userModel.findOne({"phone": req.body.phone}, function (error, result) {
        if (result == null) {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                var usermodel = new userModel({
                    name: req.body.name,
                    phone: req.body.phone,
                    password: hash,
                    otpAccountVerify: Math.floor(Math.random() * (9999 - 1111)) + 1111
                });
                usermodel.save(function (err, data) {
                    if (err) {
                        return res.status(500).send({auth: false, msg: "server error"});
                    } else {
                        client.messages.create({
                            body: 'The OTP for the phone number ' + data.phone + ' is ' + data.otpAccountVerify,
                            to: '+91' + data.phone,
                            from: process.env.TWILIO_NUMBER
                        }).then((message) => {
                            return res.status(200).send({
                                auth: true,
                                otp: true,
                                id: data.id,
                                msg: "OTP has been sent to the given number"
                            })
                        })
                            .catch((err) => {
                                return res.status(500).send({
                                    auth: true,
                                    otp: false,
                                    id: data.id,
                                    msg: "Unable to send OTP"
                                })
                            })

                    }
                });
            });
        } else {
            res.send({auth: false, msg: "user already exists"})
        }
    });
});

// OTP verification functionality
router.post('/otp-verify', function (req, res, next) {
    userModel.findOne({"phone": req.body.phone, "otpAccountVerify": req.body.otp}, function (error, result) {
        if (result == null) {
            return res.status(500).send({verification: false, message: 'Invalid OTP'})
        }
        userModel.findOneAndUpdate({
            phone: result.phone,
            otpAccountVerify: result.otpAccountVerify
        }, {$set: {verified: true}}, {upsert: false}, (error, account) => {
            if (account == null)
                return res.status(500).send({verification: false, message: "Internal Server Error"});
            return res.status(200).send({verification: true, message: "Account has been verified", id: account.id});
        });
    })
});

// TODO: AUTH Doesnot required
router.post('/login', function (req, res, next) {
    userModel.findOne({"phone": req.body.phone}, function (error, data) {
        if (data != null) {
            bcrypt.compare(req.body.password, data.password, function (err, result) {
                if (result === true) {
                    if (data.verified === false)
                        return res.status(500).send({
                            auth: true,
                            verified: false,
                            message: "Phone number should be verified"
                        });
                    return res.status(200).send({auth: true, verified: true, id: data.id});
                } else {
                    return res.status(200).send({auth: false});
                }
            });
        } else {
            return res.send({auth: false});
        }
    });
});

module.exports = router;
