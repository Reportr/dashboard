// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;
var Event = require('./event').Event;
var notify = require("./notifications").notify;


var listEvents = function(condition, req, res, next) {
	var start = req.query.start || 0;
	var limit = req.query.limit || 100;

	var query = Event.find(condition);
	query.limit(limit);
	query.skip(start);
	query.sort('-timestamp');

	query.exec(function (err, events) {
		if (err) return next(new Error("Error listing events"));
		query.count(function(err, count) {
			res.jsonp({
				"events": _.map(events, function(e) {
					return e.reprData();
				}),
				"count": count
			});
		});
	});
};


module.exports = [
	[
		/*
		 *	Track an event
		 */
		"get", ":userToken/events/track",
		function(req, res, next) {
			var data = req.query.data;

			if (!data) {
				return next(new Error("Need 'data' to track an event"));
			}

			// Parse data
			var buf = new Buffer(data, 'base64');
			data = JSON.parse(buf.toString());

			if (!data.event || data.event.indexOf("/") != -1) {
				return next(new Error("Invalid event name"));
			}

			data.id = data.id || Date.now().toString();

			// Track event
			var e = new Event({
				'eventId': req.user.id.toString()+"/"+data.namespace+"/"+data.event+"/"+data.id,
				'userId': req.user.id.toString(),
				'name': data.event,
				'namespace': data.namespace || 'main',
				'properties': data.properties || {},
				'timestamp': data.timestamp || Date.now()
			});
			var upsertData = e.toObject();
			delete upsertData._id;
			Event.update({
				'eventId': e.eventId
			}, upsertData, {upsert: true}, function(err) {
				if (err) return next(err);

				// Notify
				notify(req.user.token, 'event', e.reprData());

				// Finish request
				res.jsonp(e.reprData());
			});
		}
	],
	[
		/*
		 *	List last events
		 */
		"get", ":userToken/events/last",
		function(req, res, next) {
			listEvents({
				'userId': req.user.id.toString()
			}, req, res, next);
		}
	],
	[
		/*
		 *	List specific events
		 */
		"get", ":userToken/events/:namespace/:name",
		function(req, res, next) {
			listEvents({
				'userId': req.user.id.toString(),
		        'namespace': req.params.namespace,
		        'name': req.params.name
			}, req, res, next);
		}
	]
];