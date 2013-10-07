define([
    "hr/hr",
    "Underscore",
    "api",
    "models/user",
    "models/eventinfo"
], function(hr, _, api, User, EventInfo) { 

    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    /*
     *  Represent the data view inside a report
     */
    var ReportDataView = hr.View.extend({
        /*
         *  Defaults settigns to store for this report in the user settings
         */
        defaultSettings: {},

        /*
         *  Constructor
         */
        initialize: function() {
            ReportDataView.__super__.initialize.apply(this, arguments);

            // parent report
            this.report = this.options.report;

            // Create settings
            this.report.loadSettings(this.defaultSettings);

            // Bind update
            this.report.eventInfo.on("events:new",  _.throttle(this.updateChart, 1500), this);
            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'report': this.report
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
                'limit': this.report.settings.limit || 10000,
                'interval': 1000,
                'period': -1,
                'property': null,
                'transform': _.size
            });

            return api.request("get", User.current.get('token')+"/data/"+this.report.eventNamespace+"/"+this.report.eventName, options);
        },
    });

    /*
     *  Represent a complete report : header with control, data view
     */
    var ReportView = hr.View.extend({
        className: "report",
        template: "report.html",
        events: {
            // Actions
            'click .report-header .action-toggle-options': 'actionToggleOptions',
            'click .report-header .action-report-remove': 'actionReportRemove',
            'click *[data-visualization]': 'actionSelectVisualisation'
        },
        defaultSettings: {
            'visualization': 'line'
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportView.__super__.initialize.apply(this, arguments);

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
            this.eventInfo.load(this.eventNamespace, this.eventName);
            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            console.log(this.settings);
            return {
                'model': this.getModel(),
                'report': this,
                'visualization': ReportView.visualizations[this.settings.visualization],
                'visualizations': ReportView.visualizations
            };
        },

        /*
         *  Return model for these events
         */
        getModel: function() {
            return this.eventInfo.model();
        },

        /*
         *  Save report settings
         */
        saveSettings: function() {
            User.current.setSettings("report/"+this.report, this.settings);
            return this;
        },

        /*
         *  Load report settings
         */
        loadSettings: function(def) {
            this.settings = User.current.getSettings("report/"+this.report);
            _.defaults(this.settings, def || {});
            return this.settings;
        },

        /*
         *  (action) Toggle options
         */
        actionToggleOptions: function(e) {
            if (e != null) e.preventDefault();
            this.$el.toggleClass("mode-options");
        },

        /*
         *  (action) Remove report
         */
        actionReportRemove: function(e) {
            if (e != null) e.preventDefault();
            this.settings = {};
            this.saveSettings();
            User.current.removeReport(this.report);
        },

        /*
         *  (action) Change visualisation
         */
        actionSelectVisualisation: function(e) {
            if (e != null) e.preventDefault();
            this.settings = {
                'visualization':  $(e.currentTarget).data("visualization")
            };
            this.saveSettings();
            this.render();
        }
    }, {
        visualizations: {},

        /*
         *  Add a data visualization view
         */
        visualization: function(options, classMethods, staticMethods) {
            options.V = ReportDataView.extend(classMethods, staticMethods);
            ReportView.visualizations[options.id] = options;
            hr.View.Template.registerComponent("report."+options.id, options.V);
            return options.V
        }
    });

    hr.View.Template.registerComponent("report", ReportView);

    return ReportView;
});