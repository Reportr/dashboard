define([
    "hr/hr",
    "api",
    "views/report",
    "collections/events"
], function(hr, api, Report, Events) { 

    /*
     *  This report visualization display an infinite table of all events
     */

    // List Item View
    var EventItem = hr.List.Item.extend({
        tagName: "tr",
        className: "event-item",
        template: "report.list.item.html",
        events: {},

        templateContext: function() {
            return {
                'event': this.model,
                'model': this.model.model(),
                'properties': this.list.options.report.eventInfo.get("properties"),
                'settings': this.list.options.report.settings
            };
        },
    });

    // List View
    var EventsList = hr.List.extend({
        tagName: "tbody",
        className: "events-list",
        Collection: Events,
        Item: EventItem,
        defaults: _.defaults({
            collection: {
                
            }
        }, hr.List.prototype.defaults)
    });

    var ReportListView = Report.visualization({
        'id': 'list',
        'name': 'List'
    }, {
        className: "report-list",
        template: "report.list.html",
        events: {
            'change .select-properties input': 'actionSelectProperty'
        },
        defaultSettings: {
            'limit': 10,
            'properties': []
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportListView.__super__.initialize.apply(this, arguments);
            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'report': this.report,
                'properties': this.report.eventInfo.get("properties"),
                'settings': this.report.settings
            };
        },

        /*
         *  After template rendering
         */
        finish: function() {
            ReportListView.__super__.initialize.apply(this, arguments);

            // Build and add list
            this.list = new EventsList({
                'report': this.report,
                'collection': {
                    'loader': "getSpecific",
                    'limit': this.report.settings.limit,
                    'eventName': this.report.eventName,
                    'eventNamespace': this.report.eventNamespace
                }
            });
            this.list.$el.appendTo(this.$(".events-table"));

            return this;
        },

        /*
         *  Events list change : do nothing (list manage realtime update)
         */
        updateChart: function() {
            return this;
        },

        /*
         *  (action) Select property
         */
        actionSelectProperty: function(e) {
            var property = $(e.currentTarget).val();
            var checked = $(e.currentTarget).is(":checked");

            if (checked) {
                this.report.settings.properties.push(property);
            } else {
                this.report.settings.properties.remove(property);
            }
            this.report.settings.properties = _.uniq(this.report.settings.properties);
            this.report.saveSettings();
            this.render();
        },
    });

    return ReportListView;
});