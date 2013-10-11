// Requires
var _ = require('underscore');

var User = require('../models/user').User;

var authApi = require('./auth');
var eventsApi = require('./events');
var dataApi = require('./data');
var modelsApi = require('./models');
var trackersApi = require('./trackers');

var addApi = function(app, api) {
	_.each(api, function(method) {
		var config = _.defaults(method[3] || {}, {
			'auth': true
		});
		app[method[0]]("/api/"+method[1], function(req, res, next) {
			if (config.auth && req.user == null)  return next(new Error("Need authenticated user"));
			next();
		}, method[2]);
	})
};

var init = function(app, server) {
	// Manage user-token based api
	app.param('userToken', function(req, res, next, userToken){
		if (req.user != null) return next();
		User.getByToken(userToken).then(function(user) {
			req.user = user;
			next();
		}, function() {
			next(new Error("Error authenticate the user by token"));
		});
	});

	app.use(app.router);

	// API Error handling
	app.use(function(err, req, res, next) {
	    if(!err) return next();
	    res.send({
	    	'error': err.message
	    }, 500);
	    
	    throw err;
	});

	// Add APIs
	addApi(app, authApi);
	addApi(app, trackersApi);
	addApi(app, eventsApi);
	addApi(app, dataApi);
	addApi(app, modelsApi);
};


// Exports
module.exports = {
	"init": init
};