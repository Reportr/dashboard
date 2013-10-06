define([
    "Underscore",
    "hr/hr",
    "vendors/socket.io"
], function(_, hr, io) {
    var NotificationsManager = hr.Class.extend({
        /*
         *  Initialize
         */
        initialize: function() {
            var that = this;
            NotificationsManager.__super__.initialize.apply(this, arguments);

            this.socket = io.connect([window.location.protocol, '//', window.location.host].join('')+"/", {
                'resource': 'socket.io'
            });
            this.socket.on('notification', function (data) {
                that.trigger(data.event, data);
            });
            return this;
        },

        /*
         *  Subscribe to a channel
         */
        subscribe: function(channel) {
            this.socket.emit('subscribe', channel);
            return this;
        },

        /*
         *  Unsubscribe from a channel
         */
        unsubscribe: function(channel) {
            this.socket.emit('unsubscribe', channel);
            return this;
        },
    });

    return new NotificationsManager();
});