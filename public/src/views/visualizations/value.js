define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "core/api",
    "utils/i18n",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/value.html"
], function(_, $, hr, api, i18n, template, BaseVisualization, templateFile) {

    var ValueVisualization = BaseVisualization.extend({
        className: "visualization visualization-value",
        defaults: {},
        events: {},
        template: templateFile,

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
        title: i18n.t("visualizations.value.title"),
        View: ValueVisualization,
        config: {
            field: {
                type: "text",
                label: i18n.t("visualizations.value.config.field.label")
            },
            value: {
                type: "text",
                label: i18n.t("visualizations.value.config.value.label"),
                help: i18n.t("visualizations.value.config.value.help")
            },
            label: {
                type: "text",
                label: i18n.t("visualizations.value.config.label.label"),
                help: i18n.t("visualizations.value.config.label.help")
            }
        }
    };
});