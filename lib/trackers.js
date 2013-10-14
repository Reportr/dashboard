var _ = require("underscore");
var passport = require('passport');

var config = require("./config");
var User = require("./models/user").User;

var trackers = [];
var tasks = [];

var Tracker = function(app, trackerModule, config) {
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

	// Define attrs
	this.app = app;
	this.tasks = [];
	this.config = config || {};
	this.authRedirect = null;

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

// Setup oauth
Tracker.prototype.setupOAuth = function(Strategy, options) {
	var that = this;
	_.defaults(this.config, {
		'interval': 60*60,
		'clientId': null,
		'clientSecret': null
	});

	options = _.defaults(options || {}, {
		'strategyOptions': {
			'passReqToCallback': true,
			'clientID': this.config.clientId,
			'clientSecret': this.config.clientSecret,
			'callbackURL': "/auth/"+that.id+"/callback"
		},
		'authOptions': {}
	});

	if (this.config.clientId == null
	|| this.config.clientSecret == null) {
		console.log(this.id, " tracker need oauth 'clientId' and 'clientSecret' to work");
		return false;
	}

	// oAuth
	passport.use(new Strategy(options.strategyOptions, function(req, accessToken, refreshToken, profile, done) {
			console.log(that.id, ":new user ", accessToken, refreshToken, profile.id);
			
			// Set tracker settings
			req.user.setTrackerSettings(that.id, {
				'userId': profile.id,
				'accessToken': accessToken,
				'refreshToken': refreshToken
			});

			// Save user
			req.user.save(function(err, user) {
				that.runUserTasks(user);
				done(err, user);
			});
		}
	));
	this.app.get('/auth/'+that.id, passport.authenticate(that.id, options.authOptions));
	this.app.get('/auth/'+that.id+'/callback', passport.authenticate(that.id, { failureRedirect: '/error' }), function(req, res) {
		res.redirect('/');
	});

	// Auth for this tracker
	this.authRedirect = '/auth/'+that.id;

	return this;
};

// Run all tasks for an user
Tracker.prototype.runUserTasks = function(user) {
	console.log(this.id, ": run task for", user.token);
	_.each(this.tasks, function(task, i) {
		setTimeout(function() {
			task(user);
		}, i*config.tasks.interval);
	});
	return this;
};

// Add a task for all users who installed the tracker
Tracker.prototype.addTask = function(callback, interval) {
	var that = this;
	var d = 0;
	var taskStart, taskEnd, taskDuration;
	console.log("tracker: add task", this.id, "(every", interval, "seconds)");

	callback = _.bind(callback, this);

	var task = function() {
		var filter = {};
		filter["trackers."+that.id] = {
			"$exists": true
		};

		console.log("tracker: run task", that.id);
		taskStart = Date.now();

		User.find(filter, function(err, users) {
			if (err) return new Error(err);
			try {
				_.each(users, callback);
			} catch(err) {
				console.log("Error in task ", that.id);
				console.log(err.stack || err);
			}
			taskEnd = Date.now();
			taskDuration = (taskEnd-taskStart)/1000;
			console.log("tracker: task", that.id, "finished in ", taskDuration, "secs for", _.size(users), "users");
		});
	};
	this.tasks.push(callback);
	tasks.push(that.id);

	d = _.size(tasks)*config.tasks.interval;

	setTimeout(function() {
		task();
		setInterval(task, interval*1000);
	}, d);
};


// Load all trackers
var init = function(app) {
	var trackersConf = config.trackers || [];
	_.each(trackersConf, function(trackerConf) {
		trackers.push(new Tracker(app, trackerConf.module, trackerConf.config));
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