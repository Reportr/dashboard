var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("api.trackers");
	var api = imports.api;
	var trackers = imports.trackers;

	api.register("trackers", [
		[
			/*
			 *	Get list of trackers
			 */
			"get", ":userToken/trackers",
			function(req, res, next) {
				res.jsonp(_.map(trackers.trackers, function(tracker) {
					return tracker.reprData(req.user);
				}));
			}
		],
		[
			/*
			 *	Toggle a tracker
			 */
			"post", ":userToken/tracker/:trackerId/toggle",
			function(req, res, next) {
				req.user.toggleTracker(req.params.trackerId, undefined, function(url) {
					req.user.save(function(err) {
						if (err) next(new Error("Error adding tracker"));
						
						res.jsonp({
							'url': url,
							'id': req.params.trackerId,
							'active': req.user.hasTracker(req.params.trackerId)
						});
					});
				})
			}
		]
	]);


    register(null, {});
};

// Exports
module.exports = setup;
