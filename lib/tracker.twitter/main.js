var _ = require("underscore");
var moment = require('moment');
var TwitterStrategy = require('passport-twitter').Strategy;
var Twit = require('twit');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.twitter");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "twitter",
		'name': "Twitter",
		'description': "Track your twitter activity: tweets, mentions.",

		'initConfig': function() {
			_.defaults(this.config, {
				'interval': 60*60
			});
		},

		'initWeb': function() {
			this.oauth(TwitterStrategy, {
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
				if (userConfig == null || userConfig.accessToken == null) return;

				// Create client
				var client = new Twit({
					'consumer_key': that.config.clientId,
					'consumer_secret': that.config.clientSecret,
					'access_token': userConfig.accessToken,
					'access_token_secret': userConfig.refreshToken
				});

				// Trck tweets
				that.trackTweets(client, user, userConfig);	
			}, this.config.interval);
		},

		// Track user tweets
		trackTweets: function(client, user, userConfig) {
			var that = this;

			// Define model
			user.setModel({
				'eventNamespace': that.id,
				'eventName': 'tweet',

				'name': "Tweets",
				'icon': '$twitter',
				'description': "Tweets posted."
			});

			client.get('statuses/user_timeline', {}, function (err, reply) {
				if (err) {
					console.log("twitter: error getting tweets", err)
					return;
				}
				_.each(reply, function(tweet) {
					if (!tweet.created_at
					|| !tweet.id
					|| !tweet.text) {
						console.log("twitter: invalid tweet ", tweet);
						return;
					}

					var timestamp = moment(tweet.created_at).unix() * 1000;
					var properties = {
						'id': tweet.id,
						'text': tweet.text,
						"retweets": tweet.retweet_count || 0,
						"favorites": tweet.favorite_count || 0
					};

					if (tweet.coordinates
					&& tweet.coordinates.length == 2) {
						properties = _.extend(properties, {
							'@lat': tweet.coordinates[0],
							'@lng': tweet.coordinates[1]
						});
					}

					// Track as an event
					user.track({
						'eventId': tweet.id,
						'namespace': that.id,
						'name': 'tweet',
						'properties': properties,
						'timestamp': timestamp
					});
				});
			});
		}
	});


    register(null, {
    	'tracker.twitter': tracker
    });
};

// Exports
module.exports = setup;
