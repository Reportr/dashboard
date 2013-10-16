/*
 *	Client library for Reportr API
 *	Use browserify to use it in the browser.
 */
var _ = require('underscore');
var Q = require('Q');
var jsonp = require('./jsonp');

var Reportr = function(host, token, mode) {
	this.host = host;
	this.token = token;
	this.jsonp = jsonp[mode || 'browser'];
};


/*
 *	Track an event
 *	:eventNamespace : namespace for the event
 *	:eventName : name of teh event
 *	:properties : event properties
 *	:options : others options to send
 */
Reportr.prototype.track = function(eventNamespace, eventName, properties, options) {
	var deferred = Q.defer();

	var data = _.extend(options || {}, {
		'event': eventName,
		'namespace': eventNamespace,
		'properties': properties
	});

	// JSON encode
	data = JSON.stringify(data);

	// Base64 encode
	data = (new Buffer(data)).toString('base64');

	this.jsonp(this.host+"/api/"+this.token+"/events/track?callback=?&data="+data, function(err, data) {
		if (!err) return deferred.resolve(data);
        deferred.reject(err);
	});

	return deferred.promise;
};

/*
 *	Add a model
 *	:eventNamespace : namespace for the event
 *	:eventName : name of teh event
 *	:options : model definition
 */
Reportr.prototype.model = function(eventNamespace, eventName, options) {
	var deferred = Q.defer();

	var data = _.extend(options || {}, {
		'event': eventName,
		'namespace': eventNamespace
	});

	// JSON encode
	data = JSON.stringify(data);

	// Base64 encode
	data = (new Buffer(data)).toString('base64');

	this.jsonp(this.host+"/api/"+this.token+"/model/set?callback=?&data="+data, function(err, data) {
		if (!err) return deferred.resolve(data);
        deferred.reject(err);
	});

	return deferred.promise;
};

module.exports = Reportr