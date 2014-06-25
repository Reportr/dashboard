var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var visualizationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    configuration: {
        type: Object,
        default: {}
    }
});

visualizationSchema.methods.repr = function() {
    return {
        id: this.id.toString(),
        type: this.type,
        eventName: this.eventName,
        configuration: this.configuration
    };
};

module.exports = visualizationSchema;
