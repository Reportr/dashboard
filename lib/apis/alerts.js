var _ = require("lodash");

var api = require("./api.js");
var Alert = require("../models/alert");
var alerts = require("../alerts")

// Create an alert
api.register("post", "alerts", function(args) {
    var r = new Alert(args);

    return r.saveQ()
    .then(function(e) {
        return e.repr();
    })
}, {
    needed: [
        "eventName", "type", "condition"
    ]
});

// List alerts
api.register("get", "alerts", function(args) {
    return Alert.find({})
    .skip(args.start)
    .limit(args.limit)
    .execQ()
    .then(function(alerts) {
        return _.map(alerts, function(a) {
            return a.repr();
        });
    })
}, {
    defaults: {
        start: 0,
        limit: 100
    }
});

// List alerts types
api.register("get", "alerts/types", function(args) {
    return _.map(alerts.ALL, function(a) {
        return {
            id: a.id,
            title: a.title
        };
    })
});

