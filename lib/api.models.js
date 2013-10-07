// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;
var EventModel = require('./eventmodel').EventModel;
var notify = require("./notifications").notify;

module.exports = [
	[
		/*
		 *	Set an event model
		 */
		"get", ":userToken/model/set",
		function(req, res, next) {
			var data = req.query.data;

			if (!data) {
				return next(new Error("Need 'data' to define a model"));
			}

			// Parse data
			var buf = new Buffer(data, 'base64');
			data = JSON.parse(buf.toString());

			if (!data.event
			|| !data.name
			|| data.event.indexOf("/") != -1) {
				return next(new Error("Invalid model data"));
			}

			// Add model
			req.user.setModel({
				'modelId': req.user.id.toString()+"/"+data.namespace+"/"+data.event,
				'userId': req.user.id.toString(),
				'eventName': data.event,
				'eventNamespace': data.namespace,
				'name': data.name,
				'icon': data.icon || "",
				'description': data.description || ""
			}).then(function(e) {
				// Notify
				notify(req.user.token, 'model', e.reprData());

				// Finish request
				res.send(e.reprData());
			}, next);
		}
	],
	[
		/*
		 *	List events models
		 */
		"get", ":userToken/models",
		function(req, res, next) {
			var start = req.query.start || 0;
			var limit = req.query.limit || 100;

			var query = EventModel.find({
				'userId': req.user.id.toString()
			});
			query.limit(limit);
			query.skip(start);

			query.exec(function (err, models) {
				if (err) return next(new Error("Error listing models"));
				query.count(function(err, count) {
					res.jsonp({
						"models": _.map(models, function(e) {
							return e.reprData();
						}),
						"count": count
					});
				});
			});
		}
	]
];