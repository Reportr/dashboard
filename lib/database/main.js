var mongoose = require('mongoose');

function setup(options, imports, register) {
	var config = imports.config;
	var logger = imports.logger.namespace("database");
	var connection = mongoose.connection;

	logger.log("Connection to", config.database.url, "...");
	mongoose.connect(config.database.url, function(err) {
	    if (err) logger.exception(err);

	    logger.log("Open on", config.database.url);

	    register(null, {
		    'database': {
		    	'connection': connection
			}
	    });
	});
    connection.on('error', function(err) {
    	logger.exception(err);
    });
};

// Exports
module.exports = setup;
