// Requires
var express = require("express");
var mongoose = require('mongoose');
var http = require('http');
var config = require("./config");
var api = require("./api");
var notifications = require("./notifications");
var trackers = require("./trackers");

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

    // Initialize base view
    app.use('/', express.static(__dirname + '/../public'));

    // HTTP API
    api.init(app, server);

    // Notifications API
    notifications.init(app, server);

    // Start Trackers
    trackers.init();

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
