define([
    "hr/hr",
    "api",
    "notifications",
    "models/user"
], function(hr, api, notifications, User) {
    var Event = hr.Model.extend({
        defaults: {
            'id': null,
        	'event': null,
            'namespace': null,
            'properties': {},
            'timestamp': 0,
        },

        /*
         *  Return report id
         */
        report: function() {
            return this.get("namespace")+"/"+this.get("event");
        },

        /*
         *  Return model for the event
         */
        model: function() {
            return User.current.models.getModel(this);
        }
    });

    // Notification events
    notifications.on("event", function(data) {
        notifications.trigger("events:new", new Event({}, data.data));
    });

    return Event;
});