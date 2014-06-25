require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "models/report",
    "collections/reports",
    "utils/dialogs",
    "text!resources/templates/main.html",
], function(_, $, Q, hr, args, Report, Reports, dialogs, template) {
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
            "click .action-select-report": "selectReport"
        },


        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            // Active report
            this.report = new Report();
            this.listenTo(this.report, "set", this.update);

            // All reports
            this.reports = new Reports();
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
        }
    });

    var app = new Application();
    app.reports.loadAll().then(app.run.bind(app), dialogs.error);
});
