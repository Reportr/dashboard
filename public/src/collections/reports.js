define([
    "hr/hr",
    "hr/utils",
    "models/report",
    "core/api"
], function(hr, _, Report, api) {
    var Reports = hr.Collection.extend({
        model: Report,

        // Load all reports
        loadAll: function() {
            var that = this;

            return api.execute("get:reports")
            .then(function(data) {
                that.reset(data);
                return that;
            });
        },

        // Create a new report
        create: function(args) {
            var that = this;

            return api.execute("post:reports", args)
            .then(function(data) {
                return that.loadAll();
            });
        }
    });

    return Reports;
});