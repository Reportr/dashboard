define([
    "hr/hr",
    "hr/utils",
    "models/alert",
    "core/api"
], function(hr, _, Alert, api) {
    var Alerts = hr.Collection.extend({
        model: Alert,

        // Load all alerts
        loadAll: function() {
            var that = this;

            return api.execute("get:alerts")
            .then(function(data) {
                console.log("alerts", data);
                that.reset(data);
                return that;
            });
        },

        // Create a new alert
        create: function(args) {
            var that = this;

            return api.execute("post:alerts", args)
            .then(function() {
                return that.loadAll();
            });
        }
    });

    return Alerts;
});