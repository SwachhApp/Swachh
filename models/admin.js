var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    name: { type:String },
    email: { type:String },
    password: { type:String },
    createdAd: { type:Date, default: Date.now() },
    lastLogin: { type: Date },
    vendorsCreated: { type: Number },
    superAdmin: { type:Boolean, default: false },
    phone: { type: Number, unique: true },
    googleOAuth: { type: String },
    facebookOAuth: { type: String }
});

var adminModel = mongoose.model('admin',adminSchema);
module.exports = adminModel;