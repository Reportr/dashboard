var _ = require("underscore");
var moment = require('moment');
var RunKeeperStrategy = require('passport-runkeeper').Strategy
var runkeeper = require('node-runkeeper');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.runkeeper");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "runkeeper",
		'name': "Runkeeper",
		'description': "Track your running activity from Runkeeper.",

		'initConfig': function() {
			_.defaults(this.config, {
				'interval': 60*60
			});
		},

		'initWeb': function() {
			this.oauth(RunKeeperStrategy);
		},

		'initWorker': function() {
			var that = this;

			tasks.addTrackerTask(this, function(user) {
				var userConfig = user.getTrackerSettings(that.id);
				if (userConfig == null || userConfig.accessToken == null) return;

				var client = new runkeeper.HealthGraph({
					'client_id': that.config.clientId,  
    				'client_secret': that.config.clientSecret
				});
				client.accessToken = userConfig.accessToken;
				that.trackFitnessActivities(client, user, userConfig);
			}, this.config.interval);
		},

		// Track user tweets
		trackFitnessActivities: function(client, user, userConfig) {
			var that = this;
			var modelsDefined = [];

			client.fitnessActivityFeed(client.accessToken, function(output) {
				var data = {};

				try {
					data = JSON.parse(output);
				} catch (err) {
					logger.exception(err, false);
			    	return;
				}
				

			    if (!data.items) {
			    	logger.error("Invalid runkeeper fitness data", data);
			    	return;
			    }
			    _.each(data.items, function(activity) {
			    	if (!activity.type
			    	|| !activity.start_time
			    	|| !activity.duration
			    	|| !activity.total_distance
			    	|| !activity.total_calories) {
			    		logger.error("Invalid runkeeper activity", activity);
			    		return;
			    	}

			    	var eventName = "activity"+activity.type;
			    	var timestamp = moment(activity.start_time).unix() * 1000;

			    	// Define model
			    	if (!_.contains(modelsDefined, eventName)) {
			    		modelsDefined.push(eventName);
			    		user.setModel({
							'eventNamespace': that.id,
							'eventName': eventName,

							'name': activity.type,
							'icon': '$runkeeper',
							'description': "Fitness activity "+activity.type+"."
						});
			    	}
			    	
			    	// Add event
			    	user.track({
						'eventId': timestamp,
						'namespace': that.id,
						'name': eventName,
						'properties': {
							'duration': activity.duration,
							'distance': activity.total_distance,
							'calories': activity.total_calories,
							'startTime': activity.start_time
						},
						'timestamp': timestamp
					});
			    });
			});
		}
	});


    register(null, {
    	'tracker.runkeeper': tracker
    });
};

// Exports
module.exports = setup;
