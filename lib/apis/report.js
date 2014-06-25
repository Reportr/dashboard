var _ = require("lodash");

var api = require("./api.js");
var Report = require("../models/report");

// Edit a report
api.register("put", "report/:report", function(args, context) {
    context.report.title = args.title || context.report.title;

    return context.report.saveQ()
    .then(function() {
        return context.report.repr();
    })
});

