var _ = require("lodash");

var api = require("./api.js");
var Notification = require("../models/notification");


// List reports
api.register("get", "notifications", function(args) {
    return Notification.find({})
    .skip(args.start)
    .limit(args.limit)
    .populate("alert")
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

