var _ = require("lodash");

var api = require("./api.js");
var Alert = require("../models/alert");

// Create an alert
api.register("post", "alerts", function(args) {
    var r = new Alert(args);

    return r.saveQ()
    .then(function(e) {
        return e.repr();
    })
}, {
    needed: [
        "title", "eventName", "type", "condition"
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

