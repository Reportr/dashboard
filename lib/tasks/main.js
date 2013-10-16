var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("tasks");
	var User = imports.User.Model;
	var queue = imports.queue;
	
	// Tasks lists
	var tasks = [];
	
	// Add Tasks
	var addTask = function(task, interval) {
		var taskId = _.uniqueId("task");
		logger.log("add task", taskId);
		tasks.push({
			'task': task,
			'id': taskId,
			'interval': interval || 24*60*60*1000
		});
	};

	// Add task for specific users
	var addUserTask = function(task, filter, interval) {
		addTask(function(tsk) {
			User.find(filter, function(err, users) {
				if (err) return logger.exception(err);
				logger.log("find", _.size(users), "users for task", tsk.id);
				_.each(users, task);
			});
		}, interval)
	};

	// Add task for tracker users
	//	-> run every <interval> seconds
	//	-> run when user active the tracker
	var addTrackerTask = function(tracker, task, interval) {
		// Bind activation
		queue.on("tracker."+tracker.id, function(data) {
			User.findOne({
				'token': data.token
			}, function(err, user) {
				if (err) logger.exception(err);
				task(user);
			});
		});
		
		// Add periodic task
		addUserTask(task, tracker.userFilter(), interval);
	};

	// Start background tasks
	var start = function() {
		logger.log("start background tasks");
		_.each(tasks, function(task) {
			var taskRunner = function() {
				logger.log("start task", task.id);
				task.task(task);
			};

			taskRunner();
			setInterval(taskRunner, task.interval*1000);
		});
	};

    register(null, {
    	'tasks': {
	    	'add': addTask,
	    	'addUserTask': addUserTask,
	    	'addTrackerTask': addTrackerTask,
	    	'start': start
    	}
    });
};

// Exports
module.exports = setup;
