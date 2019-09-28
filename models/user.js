var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchemna = new Schema({
    name: {type:String},
    email: {type:String,unique:true},
    password: {type:String}
});

var userModel = mongoose.model('user',userSchemna);
module.exports = userModel;