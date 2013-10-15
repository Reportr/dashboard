var Q = require('q');
var _ = require('underscore');
var events = require('events');
var util = require('util');
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    'message': String,
    'data': String, // JSON encoded
    'createdAt': {
    	'type': Date,
    	'expires': 60*60*24
    }
}, {
	'capped': {
		'size': 4024,
		'max': 1000,
		'autoIndexId': true
	}
});


var Message = mongoose.model('Message', messageSchema);
exports.Message = Message;