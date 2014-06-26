define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "collections/visualizations",
    "views/visualizations/all",
    "text!resources/templates/visualization.html"
], function(_, $, hr, Visualizations, allVisualizations, template) {

    var VisualizationView = hr.View.extend({
        className: "visualization-container",
        defaults: {},
        events: {
            "click .action-visualization-edit": "editConfig"
        },
        template: template,

        initialize: function() {
            VisualizationView.__super__.initialize.apply(this, arguments);
            this.visu = new allVisualizations[this.model.get("type")].View({
                model: this.model
            });
        },

        render: function() {
            var size = (this.model.get("configuration.size") == "big") ? 12 : 6;
            this.$el.attr("class", this.className+" col-md-"+size);

            this.visu.$el.detach();
            return VisualizationView.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.visu.appendTo(this.$(".visualization-body"));
            this.visu.update();

            this.delegateEvents();
            return VisualizationView.__super__.finish.apply(this, arguments);
        },

        editConfig: function(e) {
            if (e) e.preventDefault();

            this.model.configure()
            .then(function() {

            })
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