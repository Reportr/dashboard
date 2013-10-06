// Requires
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");

var eventModelSchema = new mongoose.Schema({
	userId: { type: String, index: true },

	modelId: { type: String, index: true, unique: true },
    eventName: { type: String, index: true },
    eventNamespace: { type: String, index: true },

    icon: String,
    name: String,
    description: String
});

// Return data to represent an event
eventModelSchema.methods.reprData = function () {
	return {
		'id': this.id.toString(),
		'event': this.eventName,
		'namespace': this.eventNamespace,
		'icon': this.icon,
		'name': this.name,
		'description': this.description
	};
};

var EventModel = mongoose.model('Model', eventModelSchema);

// Exports
exports.EventModel = EventModel;