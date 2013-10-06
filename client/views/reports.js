define([
    "hr/hr",
    "api",
    "models/user"
], function(hr, api, User) { 
    var ReportsView = hr.View.extend({
        className: "reports",
        template: "reports.html",
        events: {},

        initialize: function() {
            ReportsView.__super__.initialize.apply(this, arguments);
            User.current.on("settings.change.reports", this.render, this);
            return this;
        },

        templateContext: function() {
            return {
                'reports': User.current.reports(),
            };
        }
    });

    hr.View.Template.registerComponent("reports", ReportsView);

    return ReportsView;
});