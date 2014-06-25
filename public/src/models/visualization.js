define([
    "hr/hr"
], function(hr, api) {
    var Visualization = hr.Model.extend({
        defaults: {
            type: null,
            eventName: null,
            configuration: {}
        }
    });

    return Visualization;
});