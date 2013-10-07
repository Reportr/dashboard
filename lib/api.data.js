// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;
var Event = require('./event').Event;


// Map transofrmations name -> function
var transformations = {
    'sum': function(obj) {
		if (!_.isArray(obj) || obj.length == 0) return 0;
		return _.reduce(obj, function(sum, n) {
			return sum += n;
		})
    },
    'count': _.size,
    'min': _.min,
    'max': _.max
};

// Transform events to data serie
var processEevents = function(events, options) {
	options = _.defaults(options || {}, {
		'interval': 1000,
        'period': -1,
        'property': null,
        'transform': 'sum'
	});

	// Check transformation
	if (!_.contains(transformations, options.transform)) {
		options.transform = 'sum';
	}

    // Build a map (x->[list of values])
	var seriesMap = {};
	_.each(events, function(e) {
        var t = e.timestamp;
        if (options.period > 0 && t < (Date.now() - options.period)) {
            return;
        }

        // index
		t = Math.floor(t / options.interval)*options.interval;

        // value
        var v = !options.property ? 1 : (e.properties[options.property] || 0);
		seriesMap[t] = seriesMap[t] || [];
        seriesMap[t].push(v);
	});

    // Transform to (x->y)
    _.each(seriesMap, function(values, x) {
        seriesMap[x] = transformations[options.transform](values);
    });

	return _.pairs(seriesMap);
}


module.exports = [
	[
		/*
		 *	List specific events
		 */
		"get", ":userToken/data/:namespace/:name",
		function(req, res, next) {

			var start = req.query.start || 0;
			var limit = req.query.limit || 10000;

			var query = Event.find({
				'userId': req.user.id.toString(),
		        'namespace': req.params.namespace,
		        'name': req.params.name
			});
			query.limit(limit);
			query.skip(start);
			query.sort('-timestamp');

			query.exec(function (err, events) {
				if (err) return next(new Error("Error getting events"));

				var data = processEevents(events, req.query);

				query.count(function(err, count) {
					res.jsonp({
						"data": data,
						"count": count
					});
				});
			});
		}
	]
];