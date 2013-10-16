var _ = require("underscore");

function setup(options, imports, register) {
	var logger = imports.logger.namespace("api");
	var User = imports.User.Model;

	var apis = {};

	// Register a new api
	var registerApi = function(name, methods) {
		logger.log("register api", name);
		apis[name] = methods;
	};

	// Connect an api to an app
	var connectApi = function(app, api) {
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
		});
	};

	// Start the api server
	var start = function(app) {
		logger.log("start api server");
		
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

		// Connect APIs
		_.each(apis, _.partial(connectApi, app));
	};

    register(null, {
    	'api': {
    		'register': registerApi,
    		'start': start
    	}
    });
};

// Exports
module.exports = setup;
