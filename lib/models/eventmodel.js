// Requires
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var uuid = require("uuid");

var eventModelSchema = new mongoose.Schema({
	userId: {
		type: String,
		index: true
	},
	modelId: {
		type: String,
		index: true,
		unique: true
	},
    eventName: {
    	type: String,
    	index: true
    },
    eventNamespace: {
    	type: String,
    	index: true
    },
    icon: String,
    name: String,
    description: String
});
eventModelSchema.plugin(findOrCreate);

// Return data to represent an event
eventModelSchema.methods.reprData = function () {
	return {
		'id': this.modelId.toString(),
		'event': this.eventName,
		'namespace': this.eventNamespace,
		'icon': this.icon || '$default',
		'name': this.name || this.eventName,
		'description': this.description || ''
	};
};

var EventModel = mongoose.model('Model', eventModelSchema);

// Exports
exports.EventModel = EventModel;