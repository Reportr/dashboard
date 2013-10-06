define([
    "hr/hr",
    "api",
    "notifications",
    "models/eventmodel",
    "models/user"
], function(hr, api, notifications, EventModel, User) {
    var EventModels = hr.Collection.extend({
        model: EventModel,

        defaults: _.defaults({
            loader: "get",
            loaderArgs: [],
            limit: 10
        }, hr.Collection.prototype.defaults),

        /*
         *  Constructor
         */
        initialize: function() {
            EventModels.__super__.initialize.apply(this, arguments);

            // Add new model in realtime
            notifications.on("models:new", function(e) {
                this.add(e);
            }, this);
            return this;
        },

        /*
         *  Load models for the current user
         */
        get: function(options) {
            var self = this;
            
            options = _.defaults(options || {}, {});

            return api.request("get", User.current.get('token')+"/models", {
            	'start': this.options.startIndex,
            	'limit': this.options.limit
            }).done(function(data) {
            	self.add({
                    list: data.models,
                    n: data.count
                });
            });
        },

        /*
         *  Return model for an event
         */
        getModel: function(e, def) {
            if (!_.isString(e)) e = e.report();

            def = def || new EventModel({}, {
                "name": e,
                "event": e.split("/")[1],
                "namespace": e.split("/")[0]
            });

            return this.reduce(function(memo, model) {
                if (model.report() == e) memo = model;
                return memo;
            }, def);
        }
    });

    return EventModels;
});