define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "collections/visualizations",
    "views/visualizations/all",
    "text!resources/templates/visualization.html"
], function(_, $, hr, Visualizations, allVisualizations, template) {

    var VisualizationView = hr.List.Item.extend({
        className: "visualization-container",
        defaults: {},
        events: {},
        template: template,

        initialize: function() {
            VisualizationView.__super__.initialize.apply(this, arguments);

            this.visu = new allVisualizations[this.model.get("type")].View({
                model: this.model
            });
        },

        render: function() {
            var size = (this.model.get("size") == "big") ? 12 : 6;
            this.$el.attr("class", this.className+" col-md-"+size);

            this.visu.$el.detach();

            return VisualizationView.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.visu.appendTo(this.$(".visualization-body"));
            this.visu.update();

            return VisualizationView.__super__.finish.apply(this, arguments);
        }
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