define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dialogs",
    "collections/alerts",
    "text!resources/templates/alert.html"
], function(_, $, hr, dialogs, Alerts, template) {
    var AlertView = hr.List.Item.extend({
        className: "alert-item",
        defaults: {},
        events: {
            "click .action-alert-edit": "editConfig"
        },
        template: template,

        editConfig: function(e) {
            if (e) e.preventDefault();

            this.model.configure()
            .then(function() {

            })
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
                'html': '<span class="octicon octicon-mail"></span> <p>No alerts yet.</p>'
            });
        },
    });

    return AlertsList;
});