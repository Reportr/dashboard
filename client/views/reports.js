define([
    "hr/hr",
    "api",
    "models/user"
], function(hr, api, User) { 
    var ReportsView = hr.View.extend({
        className: "reports",
        template: "reports.html",
        events: {
            "submit .settings form": "submitSettings",
            "click .action-install-chrome": "actionInstallChrome"
        },

        initialize: function() {
            ReportsView.__super__.initialize.apply(this, arguments);
            User.current.on("settings.change.reports", this.render, this);
            return this;
        },

        templateContext: function() {
            return {
                'reports': User.current.reports(),
            };
        },

        finish: function() {
            ReportsView.__super__.finish.apply(this, arguments);
            this.toggleSettings(false);
            return this;
        },

        /*
         *  Toggle settings
         */
        toggleSettings: function(state) {
            if (_.size(User.current.reports()) == 0) {
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
            chrome.webstore.install(undefined, _.bind(this.render, this));
        }
    });

    hr.View.Template.registerComponent("reports", ReportsView);

    return ReportsView;
});