define([
    "Underscore",
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
                && e.get("namespace") == this.options.namespace)) {
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

            return api.request("get", User.current.get('token')+"/events/"+this.options.namespace+"/"+this.options.eventName, {
            	'start': this.options.startIndex,
            	'limit': this.options.limit
            }).done(function(data) {
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
            }).done(function(data) {
                self.add({
                    list: data.events,
                    n: data.count
                });
            });
        },

        /*
         *  Return list of properties
         */
        properties: function() {
            return _.uniq(this.reduce(function(memo, e) {
                memo.push.apply(memo, _.keys(e.get("properties", {})));
                return memo;
            }, []));
        },


        /*
         *	Get data series for these events collection
         */
        dataSeries: function(options) {
        	options = _.defaults(options || {}, {
        		'interval': 1000,
                'period': -1,
                'property': null,
                'transform': _.size
        	});

            // Sort the collection
            this.sort();

            // Build a map (x->[list of values])
        	var seriesMap = {};
        	this.each(function(e) {
                // Check period
                var t = e.get("timestamp");
                if (options.period > 0 && t < (Date.now() - options.period)) {
                    return;
                }

                // index
        		t = Math.floor(t / options.interval)*options.interval;

                // value
                var v = !options.property ? 1 : e.get("properties."+options.property, 0);
        		seriesMap[t] = seriesMap[t] || [];
                seriesMap[t].push(v);
        	});
            //console.log("seriesMap (x->[list of values]) ", seriesMap);

            // Transform to (x->y)
            _.each(seriesMap, function(values, x) {
                seriesMap[x] = options.transform(values);
            });
            //console.log("seriesMap (x->y) ", seriesMap);

        	return _.pairs(seriesMap);
        }
    });

    return Events;
});