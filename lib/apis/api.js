var Q = require("q");
var _ = require("lodash");

var methods = [];

// Register an api
var register = function(method, path, handler) {
    methods.push({
        'method': method,
        'path': path,
        'handler': handler
    });
};

// Init all APIs on an application
var init = function(app) {
    _.each(methods, function(method) {
        app[method.method]("/api/"+method.path, function(req, res, next) {
            Q()
            .then(function() {
                return method.handler(req.query, req.body);
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
