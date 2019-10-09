var User = require("../models/user.js");
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
// console.log(process.env.EMAIL_ID);

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.jwtSecret
}

module.exports = new JwtStrategy(opts, function (jwt_payload, done){
    User.findById(jwt_payload.id, function (err, user){
        if(err){
            return done(err, false);
        }
        if(user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
});