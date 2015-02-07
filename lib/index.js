var _ = require("lodash");
var Q = require("q");
var path = require("path");
var express = require("express");
var http = require('http');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var basicAuth = require('basic-auth-connect');

var config = require("./config");
var database = require("./database");
var apis = require("./apis/");
var queue = require("./queue");
var jobs = require("./jobs");
var alerts = require("./alerts");
var error = require("./utils/error");
var logger = require("./utils/logger")("web");

var prepare = function(mode) {
    return database.init()
    .then(function() {
        return queue.init(mode);
    })
    .then(function() {
        if (!queue.worker || mode == "worker") {
            return jobs.init();
        }
    });
};

var configure = function(options) {
    options = _.defaults(options || {}, {
        trackers: [],
        alerts: []
    });

    _.each(options.alerts, alerts.add);
};

var start = function() {
    var app = express();
    var server = http.createServer(app);

    // Parse form data
    app.use(bodyParser());

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../public/build')));

    // Enable logger
    app.use(morgan());

    // Parse and sign cookies
    // IMPORTANT: Signing is crucial for security
    app.use(cookieParser());

    // Auth
    if (config.auth.username && config.auth.password) {
        app.use(basicAuth(config.auth.username, config.auth.password));
    }

    apis.init(app);

    // Error handling
    app.use(function(req, res, next) {
        next(error.withCode(404, "Page not found"));
    });
    app.use(function(err, req, res, next) {
        var msg = err.message || err;
        var code = Number(err.code || 500);

        if (!_.contains(error.VALID_CODES, code)) code = 500;

        if (req.session) req.session.report = err.stack || err.message || err;

        // Return error
        res.format({
            'text/plain': function(){
                res.status(code);
                res.send(msg);
            },
            'application/json': function (){
                res.status(code);
                res.send({
                    'error': msg,
                    'code': code
                });
            }
        });

        logger.error(err.stack || err);
    });

    logger.log("Start listening on ", config.port);

    return prepare("web")
    .then(function() {
        return Q.nfapply(_.bind(server.listen, server), [config.port]);
    })
    .then(function() {
        logger.log("Application is now running!");
    }, function(err) {
        logger.exception(err, false);
    });
};

var worker = function() {
    return prepare("worker")
    .then(function() {
        logger.log("Worker is now running!");
    }, function(err) {
        logger.exception(err, false);
    });
};

module.exports = {
    configure: configure,
    web: start,
    worker: worker
};