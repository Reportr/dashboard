var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.ping");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "ping",
		'name': "Ping",
		'description': "Ping tests for this Reportr Tracker instance.",

		'initConfig': function() {
			_.defaults(this.config, {
				'interval': 60*60
			});
		},

		'initWorker': function() {
			tasks.addTrackerTask(this, function(user) {
				logger.log("ping user", user.token);
				user.setModel({
					'eventNamespace': 'reportr-tracker',
					'eventName': 'ping',

					'name': "Ping",
					'description': "Ping tests for this Reportr Tracker instance."
				});
				user.track({
					'namespace': 'reportr-tracker',
					'name': 'ping'
				});
			}, this.config.interval);
		}
	});


    register(null, {
    	'tracker.ping': tracker
    });
};

// Exports
module.exports = setup;
