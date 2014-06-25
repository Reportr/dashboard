define([
    "hr/hr",
    "core/api"
], function(hr, api) {
    var Report = hr.Model.extend({
        defaults: {
            id: null,
            title: null
        },

        // Update a report
        edit: function(data) {
            var that = this;

            return api.execute("put:report/"+this.get("id"), data)
            .then(function(_data) {
                that.set(_data);
                return that;
            });
        }
    });

    return Report;
});