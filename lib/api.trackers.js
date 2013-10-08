// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;


module.exports = [
	[
		/*
		 *	Get list of trackers
		 */
		"get", ":userToken/trackers",
		function(req, res, next) {

			res.jsonp([]);
		}
	]
];