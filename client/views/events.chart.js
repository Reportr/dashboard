define([
    "hr/hr",
    "Underscore",
    "api",
    "models/user",
    "models/eventmodel",
    "collections/events"
], function(hr, _, api, User, EventModel, Events) { 

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


            // Create events collection
            this.collection = new Events({
                'eventName': this.eventName,
                'namespace': this.eventNamespace
            });
            this.collection.on("add remove",  _.throttle(this.updateChart, 500), this);
            this.collection.getSpecific();
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
         *  Return model for these events
         */
        getModel: function() {
            var def = new EventModel({}, {
                'event': this.eventName,
                'namespace': this.eventNamespace,
                'name': this.eventName
            });
            return User.current.models.getModel(this.report, def);
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