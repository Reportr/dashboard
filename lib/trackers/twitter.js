var _  = require('underscore');
var moment = require('moment');
var TwitterStrategy = require('passport-twitter').Strategy;
var Twit = require('twit');

module.exports = {
	id: "twitter",
	name: "Twitter",
	description: "Track your twitter activity: tweets, mentions.",

	setup: function() {
		var that = this;
		_.defaults(this.config, {
			'interval': 60*60
		});

		// oAuth
		if (!this.setupOAuth(TwitterStrategy, {
			'strategyOptions': {
				'passReqToCallback': true,
				'consumerKey': this.config.clientId,
				'consumerSecret': this.config.clientSecret,
				'callbackURL': "/auth/"+that.id+"/callback"
			}
		})) {
			return;
		}
		
		// Cron to index
		this.addTask(function(user) {
			var userConfig = user.getTrackerSettings(this.id);
			if (userConfig == null || userConfig.accessToken == null) return;

			console.log("run twitter for ", userConfig);

			// Create client
			var client = new Twit({
				'consumer_key': this.config.clientId,
				'consumer_secret': this.config.clientSecret,
				'access_token': userConfig.accessToken,
				'access_token_secret': userConfig.refreshToken
			});

			// Trck tweets
			this.trackTweets(client, user, userConfig);	
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
};