function setup(options, imports, register) {
	var logger = imports.logger.namespace("tasks");
	
	// Tasks lists
	var tasks = [];
	
	// Add Tasks
	var addTask = function(task, interval) {
		tasks.push({
			'task': task,
			'interval': interval || 24*60*60*1000
		});
	};

	// Start background tasks
	var start = function() {
		logger.log("start background tasks");
	};

    register(null, {
    	'tasks': {
	    	'add': addTask,
	    	'start': start
    	}
    });
};

// Exports
module.exports = setup;
