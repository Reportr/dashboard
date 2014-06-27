define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dragdrop",
    "utils/dialogs",
    "collections/visualizations",
    "views/visualizations/all",
    "text!resources/templates/visualization.html"
], function(_, $, hr, dnd, dialogs, Visualizations, allVisualizations, template) {
    var drag = new dnd.DraggableType();

    var VisualizationView = hr.List.Item.extend({
        className: "visualization-el",
        defaults: {},
        events: {
            "click .action-visualization-move": "moveVisu",
            "click .action-visualization-remove": "removeVisu",
            "click .action-visualization-edit": "editConfig"
        },
        template: template,

        initialize: function() {
            var that = this;
            VisualizationView.__super__.initialize.apply(this, arguments);

            this.visu = new allVisualizations[this.model.get("type")].View({
                model: this.model
            });

            this.dropArea = new dnd.DropArea({
                view: this,
                dragType: drag,
                handler: function(visu) {
                    var i = that.collection.indexOf(that.model);
                    var ib = that.collection.indexOf(visu);

                    if (ib >= 0 && ib < i) {
                        i = i - 1;
                    }
                    visu.collection.remove(visu);
                    that.collection.add(visu, {
                        at: i
                    });

                    visu.report.edit();
                }
            });

            drag.enableDrag({
                view: this,
                data: this.model,
                start: function() {
                    return that.$el.hasClass("movable");
                },
                end: function() {
                    that.moveVisu(false);
                }
            });
        },

        render: function() {
            var size = (this.model.getConf("size") == "big") ? 12 : 6;
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
        },

        moveVisu: function(st) {
            if (!_.isBoolean(st)) st = null;
            this.$el.toggleClass("movable", st);
            this.$(".action-visualization-move").toggleClass("active", this.$el.hasClass("movable"));
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