var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
});


// Methods

// Return a json representation
reportSchema.methods.repr = function() {
    return {
        id: this.id.toString(),
        title: this.title,
    };
}


// Model
var Report = mongoose.model('Report', reportSchema);

// Exports
module.exports = Report;
