define([
    "hr/hr",
    "api",
    "models/user",
    "collections/eventmodels"
], function(hr, api, User, EventModels) { 

    // List Item View
    var EventModelItem = hr.List.Item.extend({
        className: "model-item",
        template: "models.list.item.html",
        events: {
            "click .action-report-add": "actionReportAdd"
        },

        templateContext: function() {
            return {
                'object': this.model,
            };
        },

        /*
         *  (action) Report add
         */
        actionReportAdd: function(e) {
            if (e != null) e.preventDefault();
            User.current.addReport(this.model.report());
        }
    });

    // List View
    var EventModelsList = hr.List.extend({
        className: "models-list",
        Collection: EventModels,
        Item: EventModelItem,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    hr.View.Template.registerComponent("models.list", EventModelsList);

    return EventModelsList;
});