var _  = require('underscore');
var TwitterStrategy = require('passport-twitter').Strategy;

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

			
		}, this.config.interval);
	}
};