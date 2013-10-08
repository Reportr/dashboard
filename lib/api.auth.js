// Requires
var Q = require('q');
var _ = require('underscore');
var qfail = require('./utils').qfail;
var User = require('./user').User;


var authEnd = function(res, user) {
	res.send({
		"email": user.email,
		"token": user.token
	})
};

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
				authEnd(res, user);
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
				authEnd(res, user);
			}, function() {
				next(new Error("Error sign in user"));
			});
		}
	],
	[
		/*
		 *	Sync settings between client and database
		 */
		"post", ":userToken/account/sync",
		function(req, res, next) {
			req.send(req.user.settings);
		}
	]
];