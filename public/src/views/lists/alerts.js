define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dialogs",
    "collections/alerts",
    "text!resources/templates/alert.html"
], function(_, $, hr, dialogs, Alerts, template) {
    var AlertView = hr.List.Item.extend({
        tagName: "div",
        className: "alert-item",
        defaults: {},
        events: {
            "click .action-alert-edit": "editConfig",
            "click .action-alert-remove": "removeAlert",
            "click .action-alert-toggle": "toggleAlert"
        },
        template: template,

        editConfig: function(e) {
            if (e) e.preventDefault();

            this.model.configure()
            .then(function() {

            })
        },

        removeAlert: function(e) {
            if (e) e.preventDefault();
            var that = this;

            dialogs.confirm("Do you want to remove this alert '"+_.escape(this.model.get("title"))+"' ?")
            .then(function() {
                return that.model.remove();
            });
        },

        toggleAlert: function(e) {
            if (e) e.preventDefault();
            var that = this;

            that.model.toggle();
        }
    });


    var AlertsList = hr.List.extend({
        tagName: "div",
        className: "alerts-list",
        Collection: Alerts,
        Item: AlertView,
        defaults: _.defaults({

        }, hr.List.prototype.defaults),

        displayEmptyList: function() {
            return $("<div>", {
                'class': "message-list-empty",
                'html': '<span class="octicon octicon-rss"></span> <p>No alerts yet.</p> <p><button class="action-alert-create btn btn-default">Create an alert</button></p>'
            });
        },
    });

    return AlertsList;
});