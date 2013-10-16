var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");
var crypto = require('crypto');
var findOrCreate = require('mongoose-findorcreate');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("eventmodel");

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


    register(null, {
    	'EventModel': {
    		'Model': EventModel
    	}
    });
};

// Exports
module.exports = setup;
