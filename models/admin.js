var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    name: { type:String },
    email: { type:String, unique: true },
    password: { type:String },
    passwordModified: { type: Boolean, default: false}, // A admin has to change the password once after creation. Make value true after this. 
    createdAd: { type:Date, default: Date.now() },
    lastLogin: { type: Date, default: Date.now() },
    vendorsCreated: { type: Number, default: 0 },
    superAdmin: { type:Boolean, default: false },
    phone: { type: Number, requird: false },
    googleOAuth: { type: String, default: '' },
    facebookOAuth: { type: String, default: '' }
});

var adminModel = mongoose.model('admin',adminSchema);
module.exports = adminModel;