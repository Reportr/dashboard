define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dialogs",
    "collections/visualizations",
    "views/visualizations/all",
    "text!resources/templates/visualization.html"
], function(_, $, hr, dialogs, Visualizations, allVisualizations, template) {

    var VisualizationView = hr.View.extend({
        className: "",
        defaults: {},
        events: {
            "click .action-visualization-remove": "removeVisu",
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
        },

        removeVisu: function() {
            var that = this;
            var report = this.model.report;

            dialogs.confirm("Do you really want to remove this visualization?")
            .then(function() {
                that.model.destroy();

                return report.edit().fail(dialogs.fail);
            });
        }
    });


    var VisualizationsList = hr.List.extend({
        tagName: "div",
        className: "visualizations-list",
        Collection: Visualizations,
        Item: VisualizationView,
        defaults: _.defaults({

        }, hr.List.prototype.defaults),

        displayEmptyList: function() {
            return $("<div>", {
                'class': "visualizations-list-empty",
                'html': '<span class="octicon octicon-pulse"></span> <p>This report is empty.</p>'
            });
        },
    });

    return VisualizationsList;
});