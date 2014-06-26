define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "core/api",
    "views/visualizations/base",
    "text!resources/templates/visualizations/value.html"
], function(_, $, hr, api, BaseVisualization, template) {

    var ValueVisualization = BaseVisualization.extend({
        className: "visualization visualization-value",
        defaults: {},
        events: {},
        template: template,

        pull: function() {
            return api.execute("get:events", {
                type: this.model.get("eventName"),
                limit: 1
            }).get(0);
        }
    });

    return {
        title: "Last Value",
        View: ValueVisualization,
        config: {
            field: {
                type: "text",
                label: "Field"
            },
            before: {
                type: "text",
                label: "Label Before"
            },
            after: {
                type: "text",
                label: "Label After"
            },
            label: {
                type: "text",
                label: "Label"
            }
        }
    };
});