define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "collections/visualizations"
], function(_, $, hr, Visualizations) {
    var VisualizationView = hr.List.Item.extend({
        className: "visualization",
        defaults: {},
        events: {},
    });


    var VisualizationsList = hr.List.extend({
        tagName: "div",
        className: "visualizations-list",
        Collection: Visualizations,
        Item: VisualizationView,
        defaults: _.defaults({

        }, hr.List.prototype.defaults)
    });

    return VisualizationsList;
});