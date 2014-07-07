define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/i18n",
    "core/api",
    "views/visualizations/base",
    "text!resources/templates/visualizations/bar.html"
], function(_, $, hr, i18n, api, BaseVisualization, templateFile) {

    var BarVisualization = BaseVisualization.extend({
        className: "visualization visualization-bar",
        defaults: {},
        events: {},
        template: templateFile,

        pull: function() {
            var that = this;

            return api.execute("get:stats/categories", {
                type: this.model.get("eventName"),
                field: this.model.getConf("field")
            })
            .then(function(data) {
                return data.slice(0, that.model.getConf("max", 4));
            });
        }
    });

    return {
        title: i18n.t("visualizations.bar.title"),
        View: BarVisualization,
        config: {
            'field': {
                'type': "text",
                'label': i18n.t("visualizations.bar.config.field")
            },
            'max': {
                'type': "number",
                'label': i18n.t("visualizations.bar.config.max"),
                'min': 1,
                'max': 100,
                'default': 4
            }
        }
    };
});