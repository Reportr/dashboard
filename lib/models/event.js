var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();

var objects = require('../utils/objects');

var eventSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    properties: {
        type: Object,
        default: {}
    },
    propertiesKeys: {
        type: Array,
        default: [],
        index: true
    }
});

// Indexes
eventSchema.index({ type: 1, date: 1});

eventSchema.pre('save', function(next) {
    this.propertiesKeys = _.keys(objects.flatten(this.properties));

    next();
});


// Statics

// Push a new event
eventSchema.statics.push = function(type, properties) {
    var e = new Event({
        type: type,
        properties: properties || {},
        date: new Date()
    });

    return e.saveQ();
};

// Methods

// Return a json representation
eventSchema.methods.repr = function() {
    return {
        'type': this.type,
        'date': Math.floor(this.date.getTime() / 1000),
        'properties': this.properties
    };
}


// Model
var Event = mongoose.model('Event', eventSchema);

// Exports
module.exports = Event;
