define([
    "hr/hr"
], function(hr) {
    var Report = hr.Model.extend({
        defaults: {
            id: null,
            title: null
        }
    });

    return Report;
});