define([
    "hr/hr",
    "api",
    "notifications",
    "models/user"
], function(hr, api, notifications, User) {
    /*
     *  EventInfo model represent informations given by the api using /api/<token>/event/<namespace>/<event>
     *  about some events.
     *  It used to get a list of all properties names and types of an events collection.
     */
    var EventInfo = hr.Model.extend({
        defaults: {
        	'event': null,
            'namespace': null,
            'properties': {},
            'timestamp': 0,
        },

        /*
         *  Constructor
         */
        initialize: function() {
            EventInfo.__super__.initialize.apply(this, arguments);

            // Signal eventsi n relatime
            notifications.on("events:new", function(e) {
                if (e.report() == this.report()) {
                    this.trigger("events:new", e);
                }
            }, this);
            return this;
        },

        /*
         * Load info about events
         */
        load: function(eventNamespace, eventName) {
            var that = this;
            return api.request("get", User.current.get('token')+"/event/"+eventNamespace+"/"+eventName, {}).done(function(data) {
                that.set(data);
            });
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

    return EventInfo;
});