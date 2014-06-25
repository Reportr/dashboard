define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "hr/promise"
], function(_, $, hr, Q) {
    var BaseVisualization = hr.View.extend({
        className: "visualization",
        defaults: {},
        events: {},

        initialize: function(options) {
            BaseVisualization.__super__.initialize.apply(this, arguments);

            this.data = null;
        },

        templateContext: function() {
            return {
                model: this.model,
                data: this.data
            }
        },

        pull: function() {
            return Q.reject("empty");
        },

        render: function() {
            var that = this;

            this.pull()
            .then(function(data) {
                that.data = data;

                BaseVisualization.__super__.render.apply(that);
            }, function(err) {
                console.error(err);
            });
        }
    });

    return BaseVisualization;
});