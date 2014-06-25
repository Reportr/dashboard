var _ = require("lodash");
var Q = require("q");
var mongoose = require('mongoose-q')();

var logger = require("./utils/logger")("database");
var config = require("./config");

// Register all models to mongoose
var models = require('./models/');

var init = function() {
    var d = Q.defer();
    var connection = mongoose.connection;

    logger.log("Connection to", config.database.url, "...");
    mongoose.connect(config.database.url, function(err) {
        if (err) return d.reject(err);
        logger.log("Open on", config.database.url);

        d.resolve(connection);
    });

    connection.on('reconnected', function () {
        logger.log('Reconnected');
    });

    connection.on('disconnected', function () {
        logger.log('Disconnected');
    });

    connection.on('error', function(err) {
        logger.exception(err);
    });

    return d.promise;
};


module.exports = {
    init: init
};