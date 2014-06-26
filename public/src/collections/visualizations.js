define([
    "hr/hr",
    "hr/utils",
    "models/visualization",
    "core/api"
], function(hr, _, Visualization, api) {
    var Visualizations = hr.Collection.extend({
        model: Visualization,

        initialize: function() {
            Visualizations.__super__.initialize.apply(this, arguments);

            this.report = this.options.report;
        },
    });

    return Visualizations;
});