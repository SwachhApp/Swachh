var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    userId: {type: String, required: true},
    vendorId: {type: String, default: ""},
    createdAt: {type: Date, default: Date.now()},
    orderStatus: {type: Number, default: 0}, // 0 : order placed, 1: order picked up, 2: order evaluted, 3: Money received
    pickedUpDate: {type: Date, default: Date.now()},
    wasteInKG: { type: Number, default: 0},
    approvedBy: {type: String, default: ""}, //Admin ID who approved the order Request
    userLoc: {
        lat: {type: String, default: ""},
        lang: {type:String, default: ""}
    },
    vendorLoc: {
        lat: {type: String, default: ""},
        lang: {type:String, default: ""}
    },
    completed: { type: Boolean, default: false}
});

var orderModel = mongoose.model('order',orderSchema);
module.exports = orderModel;