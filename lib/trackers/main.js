var events = require('events');
var util = require('util');
var _ = require("underscore");
var passport = require('passport');

function setup(options, imports, register) {
	var logger = imports.logger.namespace("trackers");
	var User = imports.User.Model;
	var config = imports.config;
	var tasks = imports.tasks;

	// List of tracker services
	var trackers = {};

	var TrackerService = function(trackerModule) {
		events.EventEmitter.call(this);

		// Return data to represent this tracker for a user
		this.reprData = function(user) {
			return {
				'id': this.id,
				'name': this.name,
				'description': this.description || "",
				'active': user.hasTrackerService(this.id)
			};
		};

		// Initialize configuration
		this.initConfig = function() {
			/* nothing to do */
		};

		// Initialize for workers
		this.initWorker = function() {
			/* nothing to do */
		};

		// Initialize for web
		this.initWeb = function(app) {
			/* nothing to do */
		};

		// Initialize the tracker with configuration
		this.init = function(properties, options) {
			options = _.defaults(options || {}, {
				'worker': false,
				'web': false
			});
			properties = _.defaults(properties || {}, {
				'config': {}
			});

			// Init config
			_.extend(this, properties);
				this.initConfig();

				if (options.worker) {
					this.initWorker();
				}

				if (options.web) {
					this.initWeb();
				}
		};

		// Setup oauth
		this.oauth = function(app, Strategy, options) {
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
				logger.error(this.id, " tracker need oauth 'clientId' and 'clientSecret' to work");
				return false;
			}

			// oAuth
			passport.use(new Strategy(options.strategyOptions, function(req, accessToken, refreshToken, profile, done) {
					console.log(that.id, ":new user ", accessToken, refreshToken, profile.id);
					
					// Set tracker settings
					req.user.setTrackerServiceSettings(that.id, {
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

			logger.log("oauth ready for", that.id);

			return this;
		};

		// Add a task for all users who installed the tracker
		this.addUserTask = function(callback, interval) {
			var that = this;
			var d = 0;
			var taskStart, taskEnd, taskDuration;
			logger.log("add task", this.id, "(every", interval, "seconds)");

			callback = _.bind(callback, this);

			var task = function() {
				var filter = {};
				filter["trackers."+that.id] = {
					"$exists": true
				};

				logger.log("run task", that.id);
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
					logger.log("task", that.id, "finished in ", taskDuration, "secs for", _.size(users), "users");
				});
			};
			tasks.add(task, interval);
		};

		_.extend(this, trackerModule);
		_.bindAll(this);
	};
	util.inherits(TrackerService, events.EventEmitter);

	// Register trackers
	var registerTracker = function(module) {
		logger.log("register tracker", module.id);
		trackers[module.id] = new TrackerService(module);
	};

	// Load all trackers
	var start = function(trackerProps, options) {
		options = _.defaults(options || {}, {
			// (boolean) Load trackers in mode web
			'web': false,

			// (boolean) Load trackers in mode worker
			'worker': false
		});

		// Load all tracker
		logger.log("Initialize", _.size(trackers), "trackers");
		_.each(trackers, function(tracker, trackerId) {
			var conf = config.trackers[trackerId] || {};

			logger.log("init tracker", trackerId);
			tracker.init(_.extend({}, trackerProps, {
				'config': conf
			}), options);
		});
	};

	// Return a tracker by id
	var getById = function(tId) {
		return _.find(trackers, function(tracker){
			return tracker.id == tId;
		});
	};

    register(null, {
    	'trackers': {
    		'trackers': trackers,
    		'register': registerTracker,
    		'start': start,
    		'getById': getById
    	}
    });
};

// Exports
module.exports = setup;
