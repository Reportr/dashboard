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
			'scope': ['read_mailbox']
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
		session.graphCall("/me/inbox", {
			"fields": "to,id"
		})(function(result) {
			if (result == null || result.data == null) {
				console.log("facebook: error getting inbox ", result)
			}
			_.each(result.data, function(conv) {
				that.trackConversation(session, user, userConfig, conv);
			});
		});
	},

	// Track an user conversation
	trackConversation: function(session, user, userConfig, conversation) {
		var that = this;

		// Get the other person
		var otherPerson = _.find(conversation.to.data, function(person) {
			return person.id != userConfig.userId;
		});
		if (otherPerson == null) return;

		var eventName = "conversation"+otherPerson.id;

		user.setModel({
			'eventNamespace': this.id,
			'eventName': eventName,

			'name': otherPerson.name+"/Conversation",
			'icon': 'http://graph.facebook.com/'+otherPerson.id+'/picture',
			'description': "Conversation with "+otherPerson.name
		});


		session.graphCall("/"+conversation.id+"/comments")(function(result) {
			if (result == null || result.data == null) {
				console.log("facebook: error getting comments ", result)
			}
			_.each(result.data, function(message) {
				var timestamp = moment(message.created_time).unix() * 1000;
				user.track({
					'eventId': timestamp,
					'namespace': that.id,
					'name': eventName,
					'properties': {
						'fromId': message.from.id,
						'fromName': message.from.name,
						'message': message.message
					},
					'timestamp': timestamp
				});
			});
		});
	},

	// Initialize user
	setupUser: function(user) {
		return "/auth/facebook";
	}
};