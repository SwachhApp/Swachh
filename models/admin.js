var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    name: {type:String},
    email: {type:String,unique:true},
    password: {type:String}
});

var adminModel = mongoose.model('admin',adminSchema);
module.exports = adminModel;