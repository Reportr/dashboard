define([
    "hr/hr",
    "api",
    "models/user",
    "collections/reports",
    "views/report"
], function(hr, api, User, Reports, ReportView) {

    // Reports list
    var ReportsList = hr.List.extend({
        tagName: "div",
        className: "reports-list",
        Collection: Reports,
        Item: ReportView,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    // Reports dashboard
    var ReportsView = hr.View.extend({
        className: "reports",
        template: "reports.html",
        events: {
            "submit .settings form": "submitSettings",
            "click .action-install-chrome": "actionInstallChrome"
        },

        initialize: function() {
            ReportsView.__super__.initialize.apply(this, arguments);
            
            User.current.reports.on("add remove reset", function() {
                if (User.current.reports.size() > 0) {
                    this.toggleSettings(false);
                } else {
                    this.toggleSettings(true);
                }
            }, this);

            this.reportsList = new ReportsList({
                'collection': User.current.reports
            });
            return this;
        },

        finish: function() {
            ReportsView.__super__.finish.apply(this, arguments);

            // Disable Settings
            this.toggleSettings(false);

            // Add list
            this.reportsList.$el.appendTo(this.$(".reports-list-outer"));

            return this;
        },

        /*
         *  Toggle settings
         */
        toggleSettings: function(state) {
            if (User.current.reports.size() == 0) {
                state = true;
            }
            this.$el.toggleClass("mode-settings", state);
        },

        /*
         *  (submit) Settings
         */
        submitSettings: function(e) {
            e.preventDefault();
            this.toggleSettings(false);
        },

        /*
         * (action) Install chrome extension
         */
        actionInstallChrome: function(e) {
            e.preventDefault();
            if (window.chrome == null) return;
            chrome.webstore.install(undefined, _.bind(this.render, this), function() {
                window.location.href = "https://chrome.google.com/webstore/detail/pignkdodidfdfpmocgffojoihgnnldko";
            });
        }
    });

    hr.View.Template.registerComponent("reports", ReportsView);

    return ReportsView;
});