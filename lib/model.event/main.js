var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");
var crypto = require('crypto');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("event");

	var eventSchema = new mongoose.Schema({
	    userId: {
	    	type: String,
	    	index: true
	    },
	    eventId: {
	    	type: String,
	    	index: true,
	    	unique: true
	    },
	    name: {
	    	type: String,
	    	index: true
	    },
	    namespace: {
	    	type: String,
	    	index: true
	    },
	    timestamp: Number,
	    properties: Object
	});
	eventSchema.index({
		userId: 1,
		namespace: 1,
		name: 1
	});

	// Return data to represent an event
	eventSchema.methods.reprData = function () {
		return {
			'id': this.id.toString(),
			'event': this.name,
			'namespace': this.namespace,
			'timestamp': this.timestamp,
			'properties': this.properties || {}
		};
	};

	var Event = mongoose.model('Event', eventSchema);


    register(null, {
    	'Event': {
    		'Model': Event
    	}
    });
};

// Exports
module.exports = setup;
