define([
    "hr/hr",
    "api",
    "notifications"
], function(hr, api, notifications) {
    var EventModel = hr.Model.extend({
        defaults: {
        	'event': null,
            'namespace': null,
            'icon': null,
            'name': null,
            'description': null
        },

        /*
         *  Return report id
         */
        report: function() {
            return this.get("namespace")+"/"+this.get("event");
        },

        /*
         *  Return icon
         */
        icon: function() {
            return this.get('icon') || '/static/images/models/default.png';
        }
    });

    // Notification models
    notifications.on("model", function(data) {
        notifications.trigger("models:new", new EventModel({}, data.data));
    });

    return EventModel;
});