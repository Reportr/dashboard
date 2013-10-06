define([
    "hr/hr",
    "api",
    "models/user",
    "collections/events"
], function(hr, api, User, Events) { 

    // List Item View
    var EventItem = hr.List.Item.extend({
        className: "event-item",
        template: "events.list.item.html",
        events: {},

        templateContext: function() {
            return {
                'event': this.model,
                'model': this.model.model()
            };
        },
    });

    // List View
    var EventsList = hr.List.extend({
        className: "events-list",
        Collection: Events,
        Item: EventItem,
        defaults: _.defaults({
            collection: {
                allEvents: true
            }
        }, hr.List.prototype.defaults)
    });

    hr.View.Template.registerComponent("events.list", EventsList);

    return EventsList;
});