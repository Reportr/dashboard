define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/i18n",
    "core/api",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/table.html"
], function(_, $, hr, i18n, api, template, BaseVisualization, templateFile) {

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
        title: i18n.t("visualizations.table.title"),
        View: Visualization,
        config: {
            'fields': {
                'type': "text",
                'label': i18n.t("visualizations.table.config.fields.label"),
                'help': i18n.t("visualizations.table.config.fields.help")
            },
            'limit': {
                'type': "number",
                'label': i18n.t("visualizations.table.config.limit.label"),
                'default': 50
            }
        }
    };
});