var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tracker.chrome");
	var trackers = imports.trackers;
	var tasks = imports.tasks;

	var tracker = trackers.register({
		'id': "chrome",
		'name': "Web Navigation",
		'description': "Track your web navigation to Reportr using the Google Chrome extension.",
	});


    register(null, {
    	'tracker.chrome': tracker
    });
};

// Exports
module.exports = setup;
