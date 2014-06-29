var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var alerts = require("../alerts");

var alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true,
        index: true
    },
    condition: {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        enum: alerts.TYPES,
        require: true
    },
    configuration: {
        type: Object,
        default: {}
    }
});


// Methods

// Return a json representation
alertSchema.methods.repr = function() {
    return {
        'id': this.id.toString(),
        'type': this.type,
        'title': this.title,
        'condition': this.condition,
        'configuration': this.configuration,
        'eventName': this.eventName,
        'options': alerts.byId(this.type).options,
        'interval': this.interval
    };
}


// Model
var Alert = mongoose.model('Alert', alertSchema);

// Exports
module.exports = Alert;
