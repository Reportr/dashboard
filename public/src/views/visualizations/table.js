define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "core/api",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/table.html"
], function(_, $, hr, api, template, BaseVisualization, templateFile) {

    var Visualization = BaseVisualization.extend({
        className: "visualization visualization-table",
        defaults: {},
        events: {},
        template: templateFile,

        templateContext: function() {
            var fields = this.model.getConf("fields").split(",");

            return {
                model: this.model,
                data: this.data,
                fields: fields,
                twidth: (100/(fields.length+1)).toFixed(2)
            };
        },

        pull: function() {
            return api.execute("get:events", {
                type: this.model.get("eventName"),
                limit: this.model.getConf("limit") || 50
            });
        }
    });

    return {
        title: "Table",
        View: Visualization,
        config: {
            'fields': {
                'type': "text",
                'label': "Fields",
                'help': "Separated by comas"
            },
            'limit': {
                'type': "number",
                'label': "Limit",
                'default': 50
            }
        }
    };
});