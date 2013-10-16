var MessagesQueue = require("./queue").MessagesQueue;

function setup(options, imports, register) {
	var logger = imports.logger.namespace("queue");
	var queue = new MessagesQueue(logger);

	queue.start();

    register(null, {
    	'queue': queue
    });
};

// Exports
module.exports = setup;
