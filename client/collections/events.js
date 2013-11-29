define([
    "underscore",
    "hr/hr",
    "api",
    "notifications",
    "models/event",
    "models/user"
], function(_, hr, api, notifications, Event, User) {
    var Events = hr.Collection.extend({
        model: Event,

        defaults: _.defaults({
            loader: "getSpecific",
            loaderArgs: [],
            limit: 100,
            allEvents: false
        }, hr.Collection.prototype.defaults),

        /*
         *  Constructor
         */
        initialize: function() {
            Events.__super__.initialize.apply(this, arguments);

            // Add new event in realtime
            notifications.on("events:new", function(e) {
                if (this.options.allEvents
                || (e.get("event") == this.options.eventName
                && e.get("namespace") == this.options.eventNamespace)) {
                    this.add(e, {
                        at: 0
                    });
                }
            }, this);
            return this;
        },

        /*
         *  Comparator
         */
        comparator: function(e) {
            return e.get("timestamp");
        },

        /*
         *  Get specific events
         */
        getSpecific: function(options) {
            var self = this;
            
            options = _.defaults(options || {}, {});

            return api.request("get", User.current.get('token')+"/events/"+this.options.eventNamespace+"/"+this.options.eventName, {
            	'start': this.options.startIndex,
            	'limit': this.options.limit
            }).then(function(data) {
            	self.add({
                    list: data.events,
                    n: data.count
                });
            });
        },

        /*
         *  Get last events
         */
        getLast: function(options) {
            var self = this;
            
            options = _.defaults(options || {}, {});

            return api.request("get", User.current.get('token')+"/events/last", {
                'start': this.options.startIndex,
                'limit': this.options.limit
            }).then(function(data) {
                self.add({
                    list: data.events,
                    n: data.count
                });
            });
        }
    });

    return Events;
});