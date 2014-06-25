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


var reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    visualizations: [visualizationSchema]
});


// Methods

// Return a json representation
reportSchema.methods.repr = function() {
    return {
        id: this.id.toString(),
        title: this.title,
        visualizations: this.visualizations
    };
}


// Model
var Report = mongoose.model('Report', reportSchema);

// Exports
module.exports = Report;
