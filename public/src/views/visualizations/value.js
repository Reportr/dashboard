define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "core/api",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/value.html"
], function(_, $, hr, api, template, BaseVisualization, template) {

    var ValueVisualization = BaseVisualization.extend({
        className: "visualization visualization-value",
        defaults: {},
        events: {},
        template: template,

        templateContext: function() {
            return {
                model: this.model,
                data: this.data,
                templates: {
                    label: this.model.getConf("label") || '<%- $.date(date) %>',
                    value: this.model.getConf("value") || "<%- properties."+this.model.getConf("field")+" %>"
                }
            }
        },

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
            value: {
                type: "text",
                label: "Value",
                help: "Template for the value display, see documentation for more infos about templates."
            },
            label: {
                type: "text",
                label: "Label",
                help: "Template for the label, see documentation for more infos about templates."
            }
        }
    };
});