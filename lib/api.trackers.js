// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;

var trackers = require('./trackers');

module.exports = [
	[
		/*
		 *	Get list of trackers
		 */
		"get", ":userToken/trackers",
		function(req, res, next) {
			res.jsonp(_.map(trackers.list, function(tracker) {
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
];