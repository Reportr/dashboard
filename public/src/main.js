require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "text!resources/templates/main.html",
], function(_, $, Q, hr, args, template) {
    // Configure hr
    hr.configure(args);

    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Reportr",
        template: template,
        events: {},


        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

        }
    });

    var app = new Application();
    app.run();
});
