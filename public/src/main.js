require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args"
], function(_, $, Q, hr, args) {
    // Configure hr
    hr.configure(args);

    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Reportr",
        metas: {},
        links: {},
        events: {},

        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

        }
    });

    var app = new Application();
    app.run();
});
