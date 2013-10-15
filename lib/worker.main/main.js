function setup(options, imports, register) {
	var config = imports.config;
	var logger = imports.logger.namespace("tasks");
	var tasks = imports.tasks;
    var trackers = imports.trackers;

    // Initialize trackers
    trackers.start({}, {
        'worker': true
    });

    logger.log("Start background worker");
    while (1) {};
};

// Exports
module.exports = setup;
