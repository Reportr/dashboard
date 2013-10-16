var Q = require('q');
var _ = require('underscore');
var events = require('events');
var util = require('util');
var Message = require("./message").Message;

var MessagesQueue = function(logger){
	events.EventEmitter.call(this);
	this.logger = logger;

	// Start queue
	this.start = function(){
		var that = this;
		that.logger.log('start queue');
		that.stream = Message.find({
			'createdAt': {"$gt": Date.now()}
		}).setOptions({
			'tailableRetryInterval': 100//ms
		}).tailable().stream();

		that.stream.on('data', function(msg){
		    that.logger.log('new message in queue:', msg.message);
		    that.emit(msg.message, JSON.parse(msg.data));
		}).on('error', function (error){
		    that.logger.exception(error);
		}).on('close', function () {
		    that.logger.log('queue is empty');
		});
	};

	// Post message
	this.post = function(message, data) {
		var deferred = Q.defer();
		var m = new Message({
			'message': message,
			'data': JSON.stringify(data),
			'createdAt': Date.now()
		});
		m.save(function(err, msg) {
			if (err) return deferred.reject(err);
            deferred.resolve({
            	'message': message,
				'data': data,
				'createdAt': Date.now()
            });
		});
		return deferred;
	};
};
util.inherits(MessagesQueue, events.EventEmitter);

exports.MessagesQueue = MessagesQueue;