var _ = require("lodash");

var api = require("./api.js");
var Report = require("../models/report");

// Create a report
api.register("post", "reports", function(args) {
    var r = new Report(args);

    return r.saveQ()
    .then(function(e) {
        return e.repr();
    })
}, {
    needed: [
        "title"
    ]
});

// List reports
api.register("get", "reports", function(args) {
    return Report.find({})
    .skip(args.start)
    .limit(args.limit)
    .execQ()
    .then(function(reports) {
        return _.map(reports, function(e) {
            return e.repr();
        });
    })
}, {
    defaults: {
        start: 0,
        limit: 100
    }
});

