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
		    that.logger.log('new message in queue:', msg.message, "("+msg.id+")");
		    that.emit(msg.message, JSON.parse(msg.data));
		}).on('error', function (error){
		    that.logger.exception(error);
		}).on('close', function () {
		    that.logger.log('queue is empty');
		    setTimeout(function() {
		    	that.logger.log('restart queue because empty');
		    	that.start();
		    }, 500);
		});
	};

	// Post message
	this.post = function(message, data) {
		var that = this;
		var deferred = Q.defer();
		var m = new Message({
			'message': message,
			'data': JSON.stringify(data),
			'createdAt': Date.now()
		});
		m.save(function(err, msg) {
			if (err) {
				that.logger.exception(err);
				return deferred.reject(err);
			}
            deferred.resolve({
            	'message': message,
				'data': data,
				'createdAt': Date.now()
            });
		});
		return deferred.promise;
	};
};
util.inherits(MessagesQueue, events.EventEmitter);

exports.MessagesQueue = MessagesQueue;