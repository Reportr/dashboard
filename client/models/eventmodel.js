define([
    "hr/hr",
    "api",
    "notifications",
    "models/user"
], function(hr, api, notifications, User) {
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
        },

        /*
         *  Remove events associated and the model
         */
        removeEvents: function() {
            var that = this;
            return api.request("delete", User.current.get("token")+"/event/"+this.get('namespace')+"/"+this.get('event')).done(function() {
                that.destroy();
            });
        }
    });

    // Notification models
    notifications.on("io:model:new", function(data) {
        notifications.trigger("models:new", new EventModel({}, data.data));
    });
    notifications.on("io:model:remove", function(data) {
        notifications.trigger("models:remove", new EventModel({}, data.data));
    });

    return EventModel;
});