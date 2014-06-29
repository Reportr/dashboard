require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "core/api",
    "models/report",
    "collections/alerts",
    "collections/reports",
    "utils/dialogs",
    "views/lists/visualizations",
    "views/visualizations/all",
    "views/dialogs/alerts",
    "text!resources/templates/main.html",
], function(_, $, Q, hr, args, api, Report, Alerts, Reports, dialogs, VisualizationsList, allVisualizations, AlertsDialog, template) {
    // Configure hr
    hr.configure(args);

    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Reportr",
        template: template,
        events: {
            "click .action-report-create": "createReport",
            "click .action-report-select": "selectReport",
            "click .action-report-edit": "editReport",
            "click .action-report-remove": "removeReport",
            "click .action-visualization-create": "createVisualization",
            "click .action-alert-manage": "manageAlerts",
            "click .action-alert-create": "createAlert"
        },


        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            // Active report
            this.report = new Report();
            this.listenTo(this.report, "set", this.update);

            // All alerts
            this.alerts = new Alerts();

            // All reports
            this.reports = new Reports();
            this.listenTo(this.reports, "add remove reset", this.update);

            // Visualizations
            this.visualizations = new VisualizationsList({
                collection: this.report.visualizations
            });
        },

        templateContext: function() {
            return {
                hasReport: this.report.get("id") != null,
                report: this.report
            };
        },

        render: function() {
            if (this.report.get("id") == null && this.reports.size() > 0) {
                return this.setReport(this.reports.first());
            }
            this.visualizations.$el.detach();

            return Application.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.visualizations.appendTo(this.$(".report-body"));
            return Application.__super__.finish.apply(this, arguments);
        },

        // Set active report
        setReport: function(r) {
            r = r.toJSON? r.toJSON() : r;

            this.report.del("visualizations", { silent: true });
            this.report.set(r);
        },

        // Change current report
        selectReport: function() {
            var that = this;

            return that.reports.loadAll()
            .then(function() {
                return dialogs.select("Select a report", "Choose a new report to open.",
                    _.object(that.reports.map(function(r) {
                        return [
                            r.get("id"),
                            r.get("title")
                        ]
                    })),
                    that.report.get("id")
                );
            })
            .then(function(rId) {
                that.setReport(that.reports.get(rId));
                return that.report;
            });
        },

        // Create a new report
        createReport: function() {
            var that = this;

            return dialogs.fields("Create a new report", {
                "title": {
                    label: "Title",
                    type: "text"
                }
            })
            .then(function(args) {
                return that.reports.create(args);
            });
        },

        // Edit current report
        editReport: function() {
            var that = this;
            return dialogs.fields("Edit report", {
                "title": {
                    label: "Title",
                    type: "text"
                }
            }, this.report.toJSON())
            .then(function(data) {
                return that.report.edit(data);
            });
        },

        // Remove current report
        removeReport: function() {
            var that = this;

            return dialogs.confirm("Remove this report?")
            .then(function() {
                return that.report.remove();
            })
            .then(function() {
                that.report.clear();
                return that.reports.loadAll();
            })
            .then(function() {
                that.update();
            })
            .fail(dialogs.error);
        },

        // Create a new visualization
        createVisualization: function() {
            var that = this;

            return api.execute("get:types")
            .then(function(types) {
                return dialogs.fields("New visualization", {
                    "eventName": {
                        'label': "Event",
                        'type': "select",
                        'options': _.chain(types)
                        .map(function(type) {
                            return [type.type, type.type];
                        })
                        .object()
                        .value()
                    },
                    "type": {
                        'label': "Type",
                        'type': "select",
                        'options': _.chain(allVisualizations)
                        .map(function(visualization, vId) {
                            return [
                                vId,
                                visualization.title
                            ];
                        })
                        .object()
                        .value()
                    }
                })
            })
            .then(function(data) {
                that.report.visualizations.add(data);

                return that.report.edit().fail(dialogs.error);
            });
        },

        // Manage alerts
        manageAlerts: function() {
            var that = this;

            return this.alerts.loadAll()
            .then(function() {
                return dialogs.open(AlertsDialog, {
                    alerts: that.alerts
                });
            });
        },

        // Create an alert
        createAlert: function() {
            var that = this;

            return Q.all([
                api.execute("get:types"),
                api.execute("get:alerts/types")
            ])
            .fail(dialogs.error)
            .spread(function(events, types) {

                return dialogs.fields("Create a new alert", {
                    "title": {
                        "label": "Title",
                        "type": "text"
                    },
                    "eventName": {
                        'label': "Event",
                        'type': "select",
                        'options': _.chain(events)
                        .map(function(type) {
                            return [type.type, type.type];
                        })
                        .object()
                        .value()
                    },
                    "type": {
                        'label': "Type",
                        'type': "select",
                        'options': _.chain(types)
                        .map(function(a) {
                            return [a.id, a.title];
                        })
                        .object()
                        .value()
                    },
                    "interval": {
                        "label": "Interval",
                        "type": "number",
                        'min': 1,
                        'default': 1,
                        'help': "Minimum interval for notifications in minutes."
                    },
                    "condition": {
                        "label": "Condition",
                        "type": "text",
                        "help": "Learn more about alert conditions in the documentation"
                    },
                });
            })
            .then(function(data) {
                return that.alerts.create({
                    'title': data.title,
                    'condition': data.condition,
                    'eventName': data.eventName,
                    'interval': data.interval,
                    'type': data.type
                })
                .then(that.manageAlerts.bind(that), dialogs.error)
            });
        }
    });

    var app = new Application();
    app.reports.loadAll().then(app.run.bind(app), dialogs.error);
});
