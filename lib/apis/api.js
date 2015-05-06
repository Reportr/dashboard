var Q = require("q");
var _ = require("lodash");

var Report = require("../models/report");
var Alert = require("../models/alert");

var methods = [];

// Register an api
var register = function(method, path, handler, options) {
    methods.push({
        'method': method,
        'path': path,
        'handler': handler,
        'options': _.defaults(options || {}, {
            needed: [],
            defaults: {}
        })
    });
};

// Init all APIs on an application
var init = function(app) {
    _.each(methods, function(method) {
        app[method.method]("/api/"+method.path, function(req, res, next) {
            var args = _.extend({}, method.options.defaults, req.query, req.body);
            var context = {};

            Q()

            // Check args
            .then(function() {
                if (_.size(method.options.needed) > 0 && _.difference(method.options.needed, _.keys(args)).length > 0) {
                    throw "Need: "+method.options.needed.join(", ");
                }
            })

            // Load context
            .then(function() {
                if (req.params.report) {
                    return Report.findByIdQ(req.params.report)
                    .then(function(report) {
                        context.report = report;
                    });
                } else if (req.params.alert) {
                    return Alert.findByIdQ(req.params.alert)
                    .then(function(alert) {
                        context.alert = alert;
                    });
                }
            })

            .then(function() {
                return method.handler(args, context);
            })
            .then(function(data) {
                res.send(data);
            }, next);
        });
    })
};

module.exports = {
    init: init,
    register: register
};
