var _ = require("underscore");
var express = require("express");
var mongoose = require('mongoose');
var http = require('http');
var passport = require('passport');
var MongoStore = require('connect-mongo')(express);

function setup(options, imports, register) {
	var config = imports.config;
	var logger = imports.logger.namespace("web");
	var database = imports.database;
    var notifications = imports.notifications;
    var api = imports.api;
    var trackers = imports.trackers;
    var User = imports.User.Model;

    // Configure passport
    passport.serializeUser(function(user, done) {
        done(null, user.token);
    });
    passport.deserializeUser(function(obj, done) {
        User.getByToken(obj).then(function(user) {
            done(null, user);
        }, function() {
            done(new Error("Error authenticate the user by token"), null);
        });
    });

    // Create server
    var app = express();
    var server = http.createServer(app);
    app.use(express.bodyParser());

    // Enable GZIP compression
    app.use(express.compress());

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Enable session
    app.use(express.cookieParser());
    app.use(express.session({
        'store': new MongoStore({
            'mongoose_connection': database.connection
        }),
        'secret': config.web.sessionSecret
    }));

    // Auth session
    app.all('*', function(req, res, next) {
        var token = req.session.userToken;
        if (token != null) {
            User.getByToken(req.session.userToken).then(function(user) {
                req.user = user;
                next();
            }, function() {
                res.send({
                    'error': "Error authenticate the user by token"
                }, 401);
            });
        } else {
            next();
        }
    });

    // Initialize base view
    app.use('/', express.static(__dirname + '/../../public'));

    // Intialize APIs
    api.start(app);

    // Initialize notifications
    notifications.start(server);

    // Initialize trackers
    trackers.start({
        'app': app
    }, {
        'web': true
    });

    // Start server
    server.listen(config.web.port, function(err) {
    	if (err) logger.exception(err);

        logger.log("Server is listening on port", config.web.port);
    	register(null, {});
    });
}

// Exports
module.exports = setup;
