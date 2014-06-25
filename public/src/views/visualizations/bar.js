define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "views/visualizations/base"
], function(_, $, hr, BaseVisualization) {
    var BarVisualization = hr.View.extend({
        className: "visualization visualization-bar",
        defaults: {},
        events: {},

        initialize: function(options) {
            BarVisualization.__super__.initialize.apply(this, arguments);
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