var _  = require('underscore');
var FoursquareStrategy = require('passport-foursquare').Strategy
var Foursquare = require('node-foursquare');

var config = require('../config');

module.exports = {
	id: "foursquare",
	name: "Foursquare",
	description: "Track your foursquare activity into Reportr.",

	setup: function() {
		var that = this;
		_.defaults(this.config, {
			'interval': 60*60
		});

		// oAuth
		if (!this.setupOAuth(FoursquareStrategy)) return;

		// Foursquare client
		this.foursquare = Foursquare({
			'secrets' : {
				'clientId': this.config.clientId,
				'clientSecret': this.config.clientSecret,
				'redirectUrl': "/auth/foursquare/callback"
			}
		});
		
		// Cron to index
		this.addTask(function(user) {
			var userConfig = user.getTrackerSettings(this.id);
			if (userConfig == null || userConfig.accessToken == null) return;

			this.trackCheckins(user, userConfig);
		}, this.config.interval);
	},

	// Track user checkins
	trackCheckins: function(user, userConfig) {
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
				var timestamp = checkin.createdAt * 1000;

				if (!checkin.venue) return;

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
	},

	// Initialize user
	setupUser: function(user) {
		return "/auth/foursquare";
	}
};