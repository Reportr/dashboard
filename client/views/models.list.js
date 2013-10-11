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
            "click .action-report-add": "actionReportAdd",
            "click .action-model-remove": "actionModelRemove"
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
            
            User.current.reports.add({
                'event': this.model.get('event'),
                'namespace': this.model.get('namespace')
            });
        },

        /*
         *  (action) Report remove
         */
        actionModelRemove: function(e) {
            if (e != null) e.preventDefault();
            
            this.model.removeEvents();
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