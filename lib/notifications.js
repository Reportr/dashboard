var socketio = require('socket.io');
var config = require("./config");

var io = null;

var notify = function(channel_id, event_id, data) {
	io.sockets.json.in(channel_id).emit('notification', {
		'event': event_id,
		'data': data,
		'channel': channel_id
	});
};

var init = function(app, server) {
	io = socketio.listen(server, {
        // Do not run a flash policy server
        // (requires root permissions)
        'flash policy port': -1,
        'destroy upgrade': false,
        'log level': 1,
    });

	// Configure
    if (!config.web.websockets) {
		io.set("transports", ["xhr-polling"]);
		io.set("polling duration", 10);
	}

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

	    socket.on('message', function(data) {
	        // Nothing yet, communication are one way
	    });
    });
};

// Exports
module.exports = {
	"init": init,
	"notify": notify
};