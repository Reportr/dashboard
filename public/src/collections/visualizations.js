define([
    "hr/hr",
    "hr/utils",
    "models/visualization",
    "core/api"
], function(hr, _, Visualization, api) {
    var Visualizations = hr.Collection.extend({
        model: Visualization
    });

    return Visualizations;
});