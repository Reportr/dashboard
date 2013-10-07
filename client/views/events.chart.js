define([
    "hr/hr",
    "Underscore",
    "api",
    "models/user",
    "models/eventmodel",
    "models/eventinfo"
], function(hr, _, api, User, EventModel, EventInfo) { 

    var EventsChartView = hr.View.extend({
        className: "events-chart",
        template: null,
        events: {},
        defaultSettings: {},

        /*
         *  Constructor
         */
        initialize: function() {
            EventsChartView.__super__.initialize.apply(this, arguments);

            // Base values
            this.report = this.options.report;
            this.eventName = this.options.report.split("/")[1];
            this.eventNamespace = this.options.report.split("/")[0];

            // Create settings
            this.settings = {};
            _.defaults(this.settings, this.defaultSettings);
            _.extend(this.settings, this.loadSettings());

            // Create event info
            this.eventInfo = new EventInfo();
            this.eventInfo.on("change", this.render, this);
            this.eventInfo.on("events:new",  _.throttle(this.updateChart, 1500), this);
            this.eventInfo.load(this.eventNamespace, this.eventName);
            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                
            };
        },

        /*
         *  Events list change : refresh the chart
         */
        updateChart: function() {
            return this.render();
        },

        /*
         *  Load events data
         */
        updateData: function(options) {
            options = _.defaults(options || {}, {
                'start': 0,
                'limit': this.settings.limit || 10000,
                'interval': 1000,
                'period': -1,
                'property': null,
                'transform': _.size
            });

            return api.request("get", User.current.get('token')+"/data/"+this.eventNamespace+"/"+this.eventName, options);
        },

        /*
         *  Return model for these events
         */
        getModel: function() {
            return this.eventInfo.model();
        },

        /*
         *  Save chart settings
         */
        saveSettings: function() {
            User.current.setSettings("report/"+this.report, this.settings);
            return this;
        },

        /*
         *  Save chart settings
         */
        loadSettings: function() {
            return User.current.getSettings("report/"+this.report);
        },

        /*
         *  (action) Remove report
         */
        actionReportRemove: function(e) {
            if (e != null) e.preventDefault();
            User.current.removeReport(this.report);
        }
    });

    return EventsChartView;
});