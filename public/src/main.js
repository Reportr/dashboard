require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "models/report",
    "collections/reports",
    "utils/dialogs",
    "views/visualizations",
    "views/visualizations/all",
    "text!resources/templates/main.html",
], function(_, $, Q, hr, args, Report, Reports, dialogs, VisualizationsList, allVisualizations, template) {
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
            "click .action-report-select": "selectReport",
            "click .action-report-edit": "editReport",
            "click .action-visualization-create": "createVisualization"
        },


        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            // Active report
            this.report = new Report();
            this.listenTo(this.report, "set", this.update);

            // All reports
            this.reports = new Reports();

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
                this.report.set(this.reports.first().toJSON(), { silent: true });
            }

            return Application.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.visualizations.appendTo(this.$(".report-body"));

            return Application.__super__.finish.apply(this, arguments);
        },

        // Change current report
        selectReport: function() {
            var that = this;

            return that.reports.loadAll()
            .then(function() {
                return dialogs.select("Select a report", "Choose a new report to open.",
                    _.chain(that.reports.map(function(r) {
                        return [
                            r.get("id"),
                            r.get("title")
                        ]
                    }))
                    .concat([
                        [
                            '',
                            '-------------------'
                        ],
                        [
                            'new',
                            'Create a new report'
                        ]
                    ])
                    .object()
                    .value(),
                    that.report.get("id")
                );
            })
            .then(function(rId) {
                if (rId == "new") return that.createReport();

                that.report.set(that.reports.get(rId).toJSON());
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

        // Create a new visualization
        createVisualization: function() {
            var that = this;

            return dialogs.fields("New visualization", {
                "eventName": {
                    'label': "Event",
                    'type': "text"
                },
                "type": {
                    'type': "select",
                    'options': _.chain(allVisualizations)
                    .map(function(visualization) {
                        return [
                            visualization.id,
                            visualization.title
                        ];
                    })
                    .object()
                    .value()
                }
            })
            .then(function(data) {
                that.report.visualizations.add(data);

                return that.report.edit().fail(dialogs.error);
            });
        }
    });

    var app = new Application();
    app.reports.loadAll().then(app.run.bind(app), dialogs.error);
});
