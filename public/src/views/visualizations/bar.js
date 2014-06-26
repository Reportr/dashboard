define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "core/api",
    "views/visualizations/base",
    "text!resources/templates/visualizations/bar.html"
], function(_, $, hr, api, BaseVisualization, template) {

    var BarVisualization = BaseVisualization.extend({
        className: "visualization visualization-bar",
        defaults: {},
        events: {},
        template: template,

        pull: function() {
            var that = this;

            return api.execute("get:stats/categories", {
                type: this.model.get("eventName"),
                field: this.model.get("configuration.field")
            })
            .then(function(data) {
                return data.slice(0, that.model.get("configuration.max", 4));
            });
        }
    });

    return {
        title: "Bar Chart",
        View: BarVisualization,
        config: {
            'field': {
                'type': "text",
                'label': "Field"
            },
            'max': {
                'type': "number",
                'label': "Max Bars",
                'min': 1,
                'max': 100,
                'default': 4
            }
        }
    };
});