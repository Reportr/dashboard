/*
 *	Example of tracker
 */
var _  = require('underscore');
var passport = require('passport');
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
			'interval': 60*60,
			'clientId': null,
			'clientSecret': null
		});

		if (this.config.clientId == null
		|| this.config.clientSecret == null) {
			console.log("Foursquare tracker need 'clientId' and 'clientSecret' to work");
			return;
		}

		// Foursquare client
		this.foursquare = Foursquare({
			'secrets' : {
				'clientId': this.config.clientId,
				'clientSecret': this.config.clientSecret,
				'redirectUrl': "/auth/foursquare/callback"
			}
		});

		// oAuth
		passport.use(new FoursquareStrategy({
				'passReqToCallback': true,
				'clientID': this.config.clientId,
				'clientSecret': this.config.clientSecret,
				'callbackURL': "/auth/foursquare/callback"
			}, function(req, accessToken, refreshToken, profile, done) {
				// Save access_token, etc in user settings
				req.user.setTrackerSettings(that.id, {
					'userId': profile.id,
					'accessToken': accessToken,
					'refreshToken': refreshToken
				});
				req.user.save(done);
			}
		));
		this.app.get('/auth/foursquare', passport.authenticate('foursquare'));
		this.app.get('/auth/foursquare/callback', passport.authenticate('foursquare', { failureRedirect: '/error' }), function(req, res) {
			res.redirect('/');
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
		user.setModel({
			'eventNamespace': 'foursquare',
			'eventName': 'checkin',

			'name': "Checkins",
			'icon': '$foursquare',
			'description': "Foursquare checkins."
		});

		return "/auth/foursquare";
	}
};