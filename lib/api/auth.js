// Requires
var Q = require('q');
var _ = require('underscore');

var User = require('../models/user').User;


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
				req.session.userToken = user.token;
				res.send(user.reprData());
			}, function() {
				next(new Error("Error with these arguments"));
			});
		}, {
			'auth': false
		}
	],
	[
		/*
		 *	Logout
		 */
		"post", "auth/logout",
		function(req, res, next) {
			req.session.userToken = null;
			res.send({
				'state': true
			})
		}, {
			'auth': false
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
				req.session.userToken = user.token;
				res.send(user.reprData());
			}, function() {
				next(new Error("Error sign in user"));
			});
		}, {
			'auth': false
		}
	],
	[
		/*
		 *	Get settings
		 */
		"post", "account/get",
		function(req, res, next) {
			res.send(req.user.reprData());
		}
	],
	[
		/*
		 *	Save settings
		 */
		"post", "account/save",
		function(req, res, next) {
			req.user.settings = req.body.settings;
			req.user.save(function(err) {
				if (err) return next(err);
				res.send(req.user.reprData());
			});
		}
	]
];