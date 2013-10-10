// Requires
var express = require("express");
var mongoose = require('mongoose');
var http = require('http');
var passport = require('passport');

var config = require("./config");
var api = require("./api");
var notifications = require("./notifications");
var trackers = require("./trackers");
var User = require('./user').User;

// Passport user serialization
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

// Start the application
function start() {
    // Connect to the database
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'db: connection error:'));
    db.once('open', function callback () {
        console.log("db: Database is open on", config.database.url);
    });
    mongoose.connect(config.database.url);

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
        secret: config.web.sessionSecret
    }));

    // Auth session
    app.all('*', function(req, res, next) {
        var token = req.session.userToken;
        if (token != null) {
            User.getByToken(req.session.userToken).then(function(user) {
                req.user = user;
                next();
            }, function() {
                next(new Error("Error authenticate the user by token"));
            });
        } else {
            next();
        }
    });

    // Initialize base view
    app.use('/', express.static(__dirname + '/../public'));

    // HTTP API
    api.init(app, server);

    // Notifications API
    notifications.init(app, server);

    // Start Trackers
    trackers.init(app);

    // Start server
    server.listen(config.web.port);
    server.on('listening', function() {
        console.log("web: Server is listening on port", config.web.port);
    });
}

// Exports
module.exports = {
    "start": start
}
