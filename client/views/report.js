define([
    "hr/hr",
    "jQuery",
    "Underscore",
    "api",
    "models/user",
    "models/eventinfo"
], function(hr, $, _, api, User, EventInfo) { 

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

            // Parent report
            this.report = this.options.report;

            // Create settings
            this.report.loadSettings(this.defaultSettings);

            // Bind update
            this.report.eventInfo.on("events:new",  _.throttle(this.updateChart, 1500), this);

            this.report.on("layout", this.updateLayout, this);
            this.report.on("layout", this.resizeChart, this);
            
            $(window).resize(_.bind(this.resizeChart, this));
            this.updateLayout();
            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'report': this.report,
                'settings': this.report.settings
            };
        },

        /*
         *  Events list change : refresh the chart
         */
        updateChart: function() {
            return this;
        },

        /*
         *  Update layout
         */
        updateLayout: function() {
            var cls = this.$el.attr("class").replace(/\blayout-*?\b/g, '');
            this.$el.attr("class", cls+" layout-"+this.report.settings.layout);
        },

        /*
         *  need to resize the chart
         */
        resizeChart: function() {
            return this;
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
        tagName: "div",
        className: "report",
        template: "report.html",
        events: {
            // Actions
            'click .report-header .action-toggle-options': 'actionToggleOptions',
            'click .report-header .action-report-remove': 'actionReportRemove',
            'click *[data-visualization]': 'actionSelectVisualisation',
            'click *[data-layout]': 'actionSelectLayout'
        },
        defaultSettings: {
            'layout': 'large',
            'visualization': 'line'
        },
        layouts: {
            '<i class="icon-align-justify"></i> Large': 'large',
            '<i class="icon-th-large"></i> Medium': 'medium'
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportView.__super__.initialize.apply(this, arguments);

            // Base values
            this.report = this.model;
            this.reports = this.list;
            this.eventName = this.model.get("event");
            this.eventNamespace = this.model.get("namespace");

            // Create settings
            this.settings = {};
            _.extend(this.settings, this.loadSettings());
            _.defaults(this.settings, this.defaultSettings);

            // Create event info
            this.eventInfo = new EventInfo();
            this.eventInfo.on("set", function() {
                this.render(true);
            }, this);
            this.eventInfo.load(this.report.get("namespace"), this.report.get("event"));

            // Layout
            this.setLayout(this.settings.layout);

            return this;
        },

        /*
         *  Render
         */
        render: function(force) {
            if (!force) return this;
            return ReportView.__super__.render.apply(this, arguments);
        },

        /*
         *  Template context
         */
        templateContext: function() {
            this.settings.visualization = this.settings.visualization || 'line';
            return {
                'model': this.getModel(),
                'report': this,
                'visualization': ReportView.visualizations[this.settings.visualization],

                'visualizations': ReportView.visualizations,
                'layouts': this.layouts
            };
        },

        /*
         *  Return model for these events
         */
        getModel: function() {
            return this.eventInfo.model();
        },

        /*
         *  Change page layout
         */
        setLayout: function(layout) {
            if (!_.contains(_.values(this.layouts), layout)) {
                layout = this.defaultSettings.layout;
            }

            this.settings.layout = layout;
            this.$el.attr("class", this.className+" layout-"+this.settings.layout);

            this.saveSettings();
            this.trigger("layout:change");

            return this;
        },

        /*
         *  Save report settings
         */
        saveSettings: function() {
            this.report.set("settings", this.settings);
        },

        /*
         *  Load report settings
         */
        loadSettings: function(def) {
            this.settings = this.report.get("settings") || {};
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
            this.report.destroy();
        },

        /*
         *  (action) Change visualisation
         */
        actionSelectVisualisation: function(e) {
            e.preventDefault();

            this.settings = {
                'visualization':  $(e.currentTarget).data("visualization")
            };
            this.saveSettings();
            this.render(true);

            return false;
        },

        /*
         *  (action) Change layout
         */
        actionSelectLayout: function(e) {
            e.preventDefault();

            this.setLayout($(e.currentTarget).data("layout"));
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