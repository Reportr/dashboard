var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var notificationSchema = new mongoose.Schema({
    alert: {
        type: mongoose.Schema.ObjectId,
        ref: 'Alert',
        required: true,
        index: true
    },
    created: {
        type: Date,
        required: true
    }
});

notificationSchema.methods.repr = function() {
    return {
        alert: this.alert.repr(),
        created: this.created.getTime()/1000
    };
};

// Model
var Notification = mongoose.model('Notification', notificationSchema);

// Exports
module.exports = Notification;
