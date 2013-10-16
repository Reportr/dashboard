var socketio = require('socket.io');

function setup(options, imports, register) {
	var queue = imports.queue;
	var config = imports.config;
	var logger = imports.logger.namespace("notifications");

	// Socket.io server (only for web process)
	var io = null;

	// Notify client using a channel (channel_id)
	// and an event (event_id)
	var notify = function(channel_id, event_id, data) {
		logger.log("post notification", channel_id, "for", event_id);
		queue.post('notification', {
			'channel': channel_id,
			'event': event_id,
			'data': data
		});
	};

	var start = function(server) {
		logger.log("start socket.io server");

		io = socketio.listen(server, {
	        // Do not run a flash policy server
	        // (requires root permissions)
	        'flash policy port': -1,
	        'destroy upgrade': false,
	        'log level': 1,
	    });

		// Configure
	    if (!config.web.websockets) {
	    	logger.log("disable websocket usage");
			io.set("transports", ["xhr-polling"]);
			io.set("polling duration", 10);
		}

		// Send messages from queue to clients
		queue.on('notification', function(notification) {
			logger.log("send notification", notification.channel, "for", notification.event);
			io.sockets.json.in(notification.channel).emit('notification', {
				'event': notification.event,
				'data': notification.data,
				'channel': notification.channel
			});
		});

		// New Connection
	    io.sockets.on('connection', function(socket) {
		    socket.on('subscribe', function(data) {
		        var channel_id = data;
		        socket.join(channel_id);
		    });

		    socket.on('unsubscribe', function(data) {
		        var channel_id = data;
		        socket.leave(channel_id);
		    });
	    });
	};

    register(null, {
    	'notifications': {
    		'start': start,
    		'notify': notify
    	}
    });
};

// Exports
module.exports = setup;
