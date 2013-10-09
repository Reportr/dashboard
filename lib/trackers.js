var _ = require("Underscore");
var config = require("./config");
var User = require("./user").User;

var trackers = [];

var Tracker = function(trackerModule, config) {
	// Load module
	if (_.isString(trackerModule)) {
		trackerModule = require(trackerModule);
	}
	_.extend(this, {
		'id': null,
		'name': '',
		'description': ''
	}, trackerModule);
	_.bindAll(this);

	// Define config
	this.config = config || {};

	// Setup tracker
	this.setup();
};

// Return data to represent this tracker for a user
Tracker.prototype.reprData = function(user) {
	return {
		'id': this.id,
		'name': this.name,
		'description': this.description || "",
		'active': user.hasTracker(this.id)
	};
};

// Setup
Tracker.prototype.setup = function() {
	/* nothing to do */
};

// Setup on an user
Tracker.prototype.setupUser = function(user) {
	/* nothing to do */
};

// Add a task for all users who instaleld the tracker
Tracker.prototype.addTask = function(callback, interval) {
	var that = this;
	console.log("tracker: add task (every", interval, "seconds)");

	setInterval(function() {
		var filter = {};
		filter["trackers."+that.id] = {
			"$exists": true
		};

		console.log("tracker: run task", this.id);

		User.find(filter, function(err, users) {
			if (err) return new Error(err);
			_.each(users, callback, that);
		})
	}, interval*1000);
};


// Load all trackers
var init = function() {
	var trackersConf = config.trackers || [];
	_.each(trackersConf, function(trackerConf) {
		trackers.push(new Tracker(trackerConf.module, trackerConf.config));
	});
};

// Return a tracker by id
var getById = function(tId) {
	return _.find(trackers, function(tracker){
		return tracker.id == tId;
	});
};

module.exports = {
	'Tracker': Tracker,
	'list': trackers,
	'init': init,
	'getById': getById
};