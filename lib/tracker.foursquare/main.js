var _ = require("underscore");
var FoursquareStrategy = require('passport-foursquare').Strategy
var Foursquare = require('node-foursquare');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.foursquare");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "foursquare",
		'name': "Foursquare",
		'description': "Track your foursquare activity into Reportr.",

		'initConfig': function() {
			_.defaults(this.config, {
				'interval': 60*60
			});
		},

		'initWeb': function() {
			this.oauth(FoursquareStrategy);
		},

		'initWorker': function() {
			var that = this;
			this.foursquare = Foursquare({
				'secrets' : {
					'clientId': this.config.clientId,
					'clientSecret': this.config.clientSecret,
					'redirectUrl': "/auth/foursquare/callback"
				}
			});

			tasks.addTrackerTask(this, function(user) {
				var userConfig = user.getTrackerSettings(that.id);
				if (userConfig == null || userConfig.accessToken == null) return;

				that.trackCheckins(user, userConfig);
			}, this.config.interval);
		},

		// Track user checkins
		'trackCheckins': function(user, userConfig) {
			logger.log("track checkin for ", user.token);
			user.setModel({
				'eventNamespace': 'foursquare',
				'eventName': 'checkin',

				'name': "Checkins",
				'icon': '$foursquare',
				'description': "Foursquare checkins."
			});

			this.foursquare.Users.getCheckins(undefined, {
				'limit': 100
			}, userConfig.accessToken, function(err, data) {
				if (data == null
				|| data.checkins == null
				|| data.checkins.items == null) {
					return;
				}

				_.each(data.checkins.items, function(checkin) {
					if (!checkin.venue || !checkin.id || !checkin.createdAt) return;
					
					var timestamp = checkin.createdAt * 1000;

					// Track as an event
					user.track({
						'eventId': timestamp, // Unique checkin by timestamp
						'namespace': 'foursquare',
						'name': 'checkin',
						'properties': {
							'checkinId': checkin.id,
							'placeId': checkin.venue.id,
							'place': checkin.venue.name,
							'@lat': checkin.venue.location.lat,
							'@lng': checkin.venue.location.lng
						},
						'timestamp': timestamp
					});
				});
			});
		}
	});


    register(null, {
    	'tracker.foursquare': tracker
    });
};

// Exports
module.exports = setup;
