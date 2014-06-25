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
            return api.execute("get:stats/categories", {
                type: this.model.get("eventName"),
                field: "domain"
            })
            .then(function(data) {
                return data.slice(0, 4);
            });
        }
    });

    return {
        id: "bar",
        title: "Bar Chart",
        View: BarVisualization,
        config: {
            field: {
                type: "string",
                label: "Field"
            }
        }
    };
});