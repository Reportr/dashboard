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
			if (config.auth && req.user == null) {
				res.send({
			    	'error': "Need user to be authenticated"
			    }, 401);
			} else {
				next();
			}
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
			res.send({
		    	'error': "Error authenticate the user by token"
		    }, 401);
		});
	});

	app.use(app.router);

	// API Error handling
	app.use(function(err, req, res, next) {
	    if(!err) return next();
	    res.send({
	    	'error': err.message
	    }, 500);
	    
	    console.log(err.stack);
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