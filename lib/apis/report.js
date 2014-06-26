var _ = require("lodash");

var api = require("./api.js");
var Report = require("../models/report");

// Edit a report
api.register("put", "report/:report", function(args, context) {
    context.report.title = args.title || context.report.title;
    context.report.visualizations = args.visualizations || context.report.visualizations;

    return context.report.saveQ()
    .then(function() {
        return context.report.repr();
    })
});

// Remove a report
api.register("delete", "report/:report", function(args, context) {
    return context.report.removeQ()
    .then(function() {
        return { deleted: true }
    })
});

