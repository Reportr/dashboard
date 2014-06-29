define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "views/dialogs/base",
    "views/lists/alerts",
    "text!resources/templates/dialogs/alerts.html"
], function(_, $, hr, DialogView, AlertsList, templateFile) {
    var AlertsDialog = DialogView.extend({
        className: "dialog-alerts modal fade",
        template: templateFile,
        events: _.extend({}, DialogView.prototype.events,{

        }),

        initialize: function() {
            AlertsDialog.__super__.initialize.apply(this, arguments);

            this.alerts = new AlertsList({
                collection: this.options.alerts
            });
        },

        templateContext: function() {
            return {
                n: this.alerts.size()
            };
        },

        finish: function() {
            this.alerts.appendTo(this.$(".alerts-container"))
            return AlertsDialog.__super__.finish.apply(this, arguments);
        }
    });

    return AlertsDialog;
});