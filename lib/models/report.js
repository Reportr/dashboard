var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var visualizationSchema = require("./visualization");

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
        visualizations: _.map(this.visualizations, function(v) { return v.repr(); })
    };
}


// Model
var Report = mongoose.model('Report', reportSchema);

// Exports
module.exports = Report;
