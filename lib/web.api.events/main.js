var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("api.events");
	var api = imports.api;
	var Event = imports.Event.Model;
	var EventModel = imports.EventModel.Model;

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

	api.register("events", [
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
				req.user.track({
					'eventId': data.id,
					'name': data.event,
					'namespace': data.namespace,
					'properties': data.properties || {},
					'timestamp': data.timestamp || Date.now()
				}).then(function(e) {
					res.jsonp(e.reprData());
				}, next);
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
		],
		[
			/*
			 *	Get event infos
			 */
			"get", ":userToken/event/:namespace/:name",
			function(req, res, next) {
				var conditions = {
					'userId': req.user.id.toString(),
			        'namespace': req.params.namespace,
			        'name': req.params.name
			    };

				Event.findOne(conditions).sort('-timestamp').exec(function(err, e) {
			        if (err) return next(new Error("Error getting event"));

			        EventModel.findOne({
						'userId': req.user.id.toString(),
				        'eventNamespace': req.params.namespace,
				        'eventName': req.params.name
				    }, function(err, model) {
				    	if (err || !model) return next(new Error("Error getting model"));

				    	Event.count(conditions, function(err, count) {
				        	if (err) return next(new Error("Error counting event"));

				        	res.jsonp({
					        	'event': model.eventName,
					        	'namespace': model.eventNamespace,
					        	'timestamp': e != null ? e.timestamp : -1,
					        	'count': count,
					        	'properties': _.reduce(e != null ? e.properties : {}, function(memo, value, key) {
					        		memo[key] = typeof value;
					        		return memo;
					        	}, {}),
					        	'model': model.reprData()
					        });
				        });
				    });
			    });
			}
		],
		[
			/*
			 *	Remove events
			 */
			"delete", ":userToken/event/:namespace/:name",
			function(req, res, next) {
				req.user.removeModel(req.params.namespace, req.params.name).then(function() {
					res.jsonp({
						'namespace': req.params.namespace,
						'event': req.params.name
					});
				}, function(err) {
					next(err);
				});
			}
		]
	]);


    register(null, {});
};

// Exports
module.exports = setup;
