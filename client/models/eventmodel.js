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
            var icon = this.get('icon', "");
            if (icon && icon[0] == '$') {
                icon = '/static/images/models/'+icon.slice(1)+'.png';
            }
            return icon || '/static/images/models/default.png';
        }
    });

    // Notification models
    notifications.on("model", function(data) {
        notifications.trigger("models:new", new EventModel({}, data.data));
    });

    return EventModel;
});