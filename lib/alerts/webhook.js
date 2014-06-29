var Q = require('q');
var _ = require('lodash');
var request = require("request");

var exec = function(notification, config) {
    var deferred = Q.defer();

    var args = {
        'notification': notification
    };

    request.post(config.url, {
        'body': args
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve();
        } else {
            deferred.reject(error || new Error("Status: "+response.statusCode));
        }
    });

    return deferred.promise;
};



module.exports = {
    id: "webhook",
    title: "Webhook",
    options: {
        url: {
            type: "text",
            label: "Url"
        }
    },
    execute: exec
}