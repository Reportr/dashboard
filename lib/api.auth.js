// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;
var User = require('./user').User;


module.exports = [
	[
		/*
		 *	Login
		 */
		"post", "auth/login",
		function(req, res, next) {
			var email = req.body.email;
			var password = req.body.password;

			if (!email || !password) {
				next(new Error("Need 'email' and 'password'"));
			}

			User.login(email, password).then(function(user) {
				res.send(user.reprData());
			}, function() {
				next(new Error("Error with these arguments"));
			});
		}
	],
	[
		/*
		 *	Sign up
		 */
		"post", "auth/signup",
		function(req, res, next) {
			var email = req.body.email;
			var password = req.body.password;

			if (!email || !password) {
				next(new Error("Need 'email' and 'password'"));
			}

			User.signIn(email, password).then(function(user) {
				res.send(user.reprData());
			}, function() {
				next(new Error("Error sign in user"));
			});
		}
	],
	[
		/*
		 *	Get settings
		 */
		"post", ":userToken/account/get",
		function(req, res, next) {
			res.send(req.user.reprData());
		}
	],
	[
		/*
		 *	Save settings
		 */
		"post", ":userToken/account/save",
		function(req, res, next) {
			req.user.settings = req.body.settings;
			req.user.save(function(err) {
				if (err) return next(err);
				res.send(req.user.reprData());
			});
		}
	]
];