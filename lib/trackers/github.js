var _  = require('underscore');
var moment = require('moment');
var GitHubStrategy = require('passport-github').Strategy
var GitHubApi = require("github");

module.exports = {
	id: "github",
	name: "GitHub",
	description: "Track your coding activity from GitHub: commits, repositories, issues, etc.",

	setup: function() {
		var that = this;
		_.defaults(this.config, {
			'interval': 60*60
		});
		
		// oAuth
		if (!this.setupOAuth(GitHubStrategy)) return;

		// Cron to index
		this.addTask(function(user) {
			var userConfig = user.getTrackerSettings(this.id);
			if (userConfig == null || userConfig.accessToken == null) return;

			var client = new GitHubApi({
				'version': "3.0.0"
			});
			client.authenticate({
			    'type': "oauth",
			    'token': userConfig.accessToken
			});

			this.trackRepositories(client, user, userConfig);
		}, this.config.interval);
	},

	// Track user repositories
	trackRepositories: function(client, user, userConfig) {
		var that = this;

		// Define model
		user.setModel({
			'eventNamespace': 'github',
			'eventName': 'repository',

			'name': "Repositories",
			'icon': '$github',
			'description': "GitHub Repositories created."
		});

		client.repos.getAll({}, function(err, res) {
        	if (err) {
        		console.log("github: error with", user.email, err);
        		return;
        	}
        	_.each(res, function(repo) {
        		var timestamp = moment(repo.created_at).unix() * 1000;

				// Track as an event
				user.track({
					'eventId': repo.id, // Unique checkin by timestamp
					'namespace': 'github',
					'name': 'repository',
					'properties': {
						'id': repo.id,
						'name': repo.name,
						'language': repo.language,
						'description': repo.description
					},
					'timestamp': timestamp
				});

				that.trackRepository(client, user, repo);
        	});
        });
	},

	// Track events for a specific user repository
	trackRepository: function(client, user, repo) {
		var eventName = 'repo'+repo.id;

		user.setModel({
			'eventNamespace': 'github',
			'eventName': eventName,

			'name': repo.full_name,
			'icon': '$github',
			'description': "Evolution of "+repo.name
		});

		user.track({
			'namespace': 'github',
			'name': eventName,
			'properties': {
				'id': repo.id,
				'name': repo.name,
				'size': repo.size,
				'language': repo.language,
				'watchers': repo.watchers_count,
				'forks': repo.forks_count,
				'issues': repo.open_issues_count
			}
		});
	}
};