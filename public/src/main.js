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

            // All reports
            this.reports = new Reports();
        },

        finish: function() {
            this.reports.loadAll().fail(dialogs.error);

            return Application.__super__.finish.apply(this, arguments);
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
    app.run();
});
