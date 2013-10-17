var _ = require("underscore");
var moment = require('moment');
var FitbitStrategy = require('passport-fitbit').Strategy;
var Fitbit = require("fitbit-js");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.fitbit");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "fitbit",
		'name': "Fitbit",
		'description': "Track your running activity from Runkeeper.",

		'initConfig': function() {
			_.defaults(this.config, {
				'interval': 60*60
			});
		},

		'initWeb': function() {
			this.oauth(FitbitStrategy, {
				'strategyOptions': {
					'passReqToCallback': true,
					'consumerKey': this.config.clientId,
					'consumerSecret': this.config.clientSecret,
					'callbackURL': "/auth/"+this.id+"/callback"
				}
			});
		},

		'initWorker': function() {
			var that = this;

			tasks.addTrackerTask(this, function(user) {
				var userConfig = user.getTrackerSettings(that.id);
				if (userConfig == null
				|| userConfig.accessToken == null
				|| userConfig.refreshToken == null) return;

				var client = new Fitbit(that.config.clientId, that.config.clientSecret);
				var clientMethod = function(method, url, callback) {
					client.apiCall(method, url,  {
						'token': {
							'oauth_token_secret': userConfig.refreshToken,
				            'oauth_token': userConfig.accessToken
				        }
				    }, callback);
				};

				that.trackActivities(clientMethod, user, userConfig);
			}, this.config.interval);
		},

		// Track user activities
		trackActivities: function(client, user, userConfig) {
			var that = this;

			// Define model
			user.setModel({
				'eventNamespace': that.id,
				'eventName': 'distance',

				'name': "Fitbit Distance",
				'icon': '$fitbit',
				'description': "Distance calculate on Fitbit."
			});

			client("GET", "/user/-/activities/distance/date/today/1m.json", function(err, res, json) {
				if (err) {
					logger.exception(err, false);
					return;
				}
				if (!json 
				|| !json["activities-distance"]) {
					logger.error("Invalid data for fitbit activities", err, res, json);
					return;
				}

				_.each(json["activities-distance"], function(activity) {
					if (!activity.dateTime
					|| !activity.value) {
						logger.error("Invalid data for fitbit activities");
						return;
					}

					var timestamp = moment(activity.dateTime).unix() * 1000;

					// Track as an event
					user.track({
						'eventId': timestamp,
						'namespace': that.id,
						'name': 'distance',
						'properties': {
							'distance': activity.value
						},
						'timestamp': timestamp
					});
				});
			});
		}
	});


    register(null, {
    	'tracker.fitbit': tracker
    });
};

// Exports
module.exports = setup;
