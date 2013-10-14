var _  = require('underscore');
var moment = require('moment');
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookClient = require("facebook-client").FacebookClient;

module.exports = {
	id: "facebook",
	name: "Facebook",
	description: "Track your social activity and your relations from Facebook.",

	setup: function() {
		var that = this;
		_.defaults(this.config, {
			'interval': 60*60
		});

		// oAuth
		if (!this.setupOAuth(FacebookStrategy, {
			'authOptions': {
				'scope': ['read_mailbox']
			}
		})) {
			return;
		}
		
		// Cron to index
		this.addTask(function(user) {
			var userConfig = user.getTrackerSettings(this.id);
			if (userConfig == null || userConfig.accessToken == null) return;

			var client = new FacebookClient(that.config.clientId, that.config.clientSecret);
			client.getSessionByAccessToken(userConfig.accessToken)(function(session) {
				that.trackConversations(session, user, userConfig);
			});
		}, this.config.interval);
	},

	// Track user conversations
	trackConversations: function(session, user, userConfig) {
		var that = this;

		user.setModel({
			'eventNamespace': this.id,
			'eventName': "message",

			'name': "Messages sent",
			'icon': '$facebook',
			'description': "Messages sent on Facebook"
		});

		session.graphCall("/me/inbox", {
			"fields": "to,id"
		})(function(result) {
			if (result == null || result.data == null) {
				console.log("facebook: error getting inbox ", result);
				return;
			}
			_.each(result.data, function(conv) {
				that.trackConversation(session, user, userConfig, conv);
			});
		});
	},

	// Track an user conversation
	trackConversation: function(session, user, userConfig, conversation) {
		var that = this;

		// Check data
		if (!conversation
		|| !conversation.id
		|| !conversation.to
		|| !conversation.to.data) {
			console.log("facebook: invalid conversation ", conversation);
			return;
		}

		// Get the other person
		var otherPerson = _.find(conversation.to.data, function(person) {
			return person.id != userConfig.userId;
		});
		if (otherPerson == null) return;

		session.graphCall("/"+conversation.id+"/comments")(function(result) {
			if (result == null || result.data == null) {
				console.log("facebook: error getting comments ", result);
				return;
			}
			_.each(result.data, function(message) {
				if (!message.created_time
				|| !message.from
				|| !message.message) {
					return;
				}

				var timestamp = moment(message.created_time).unix() * 1000;

				// Track only messages from yourself
				if (message.from.id != userConfig.userId) return;

				user.track({
					'eventId': timestamp,
					'namespace': that.id,
					'name': "message",
					'properties': {
						'toId': otherPerson.id,
						'toName': otherPerson.name,
						'message': message.message
					},
					'timestamp': timestamp
				});
			});
		});
	}
};