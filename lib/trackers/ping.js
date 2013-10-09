/*
 *	Example of tracker
 */
var _  = require('Underscore');

module.exports = {
	id: "ping",
	name: "Ping",
	description: "Ping tests for this Reportr Tracker instance.",

	setup: function() {
		_.defaults(this.config, {
			'interval': 60*60
		});
		
		/*
		 *	Add a cron to ping every hour
		 */
		this.addTask(function(user) {
			user.track({
				'namespace': 'reportr-tracker',
				'name': 'ping'
			});
		}, this.config.interval);
	},

	/*
	 *	Initialize an user
	 */
	setupUser: function(user) {
		user.setModel({
			'eventNamespace': 'reportr-tracker',
			'eventName': 'ping',

			'name': "Ping",
			'description': "Ping tests for this Reportr Tracker instance."
		});
	}
}