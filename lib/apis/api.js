var Q = require("q");
var _ = require("lodash");

var methods = [];

// Register an api
var register = function(method, path, handler, options) {
    methods.push({
        'method': method,
        'path': path,
        'handler': handler,
        'options': _.defaults(options || {}, {
            needed: []
        })
    });
};

// Init all APIs on an application
var init = function(app) {
    _.each(methods, function(method) {
        app[method.method]("/api/"+method.path, function(req, res, next) {
            var args = _.extend({}, req.query, req.body);

            Q()
            .then(function() {
                if (_.size(method.options.needed) > 0 && !_.contains.apply(null, [_.keys(args)].concat(method.options.needed))) {
                    throw "Need: "+method.options.needed.join(", ");
                }


                return method.handler(args);
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
