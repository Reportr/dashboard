/*
 *	Example of tracker
 */
var _  = require('Underscore');

module.exports = {
	name: "Ping",
	description: "Test tracker",
	icon: null,

	setup: function(tracker) {
		_.defaults(tracker.config, {
			'interval': 60*60
		});

		/*
		 *	Initialize an user
		 */
		tracker.setupUser(function(user) {
			user.setModel({
				'eventNamespace': 'reportr-tracker',
				'eventName': 'ping',

				'name': "Ping",
				'description': "Ping tests for the Reportr Tracker."
			});
		});

		/*
		 *	Add a cron to ping every hour
		 */
		tracker.addCron(function(user) {
			user.track({
				'namespace': 'reportr-tracker',
				'name': 'ping'
			});
		}, tracker.config.interval);
	},
}