define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var BaseVisualization = hr.View.extend({
        className: "visualization",
        defaults: {},
        events: {},

        initialize: function(options) {
            BaseVisualization.__super__.initialize.apply(this, arguments);
        }
    });

    return BaseVisualization;
});