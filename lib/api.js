// Requires
var _ = require('underscore');
var User = require('./user').User;

var authApi = require('./api.auth');
var eventsApi = require('./api.events');
var dataApi = require('./api.data');
var modelsApi = require('./api.models');

var addApi = function(app, api) {
	_.each(api, function(method) {
		app[method[0]]("/api/"+method[1], method[2]);
	})
};

var init = function(app, server) {
	// APi Error handling
	app.use(app.router);
	app.use(function(err, req, res, next) {
	    if(!err) return next();
	    res.send({
	    	'error': err.message
	    }, 500);
	});

	// Manage user-token based api
	app.param('userToken', function(req, res, next, userToken){
		User.getByToken(userToken).then(function(user) {
			req.user = user;
			next();
		}, function() {
			next(new Error("Error authenticate the user by token"));
		});
	});

	// Add APIs
	addApi(app, authApi);
	addApi(app, eventsApi);
	addApi(app, dataApi);
	addApi(app, modelsApi);
};


// Exports
module.exports = {
	"init": init
};