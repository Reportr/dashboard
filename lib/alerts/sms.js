var Q = require('q');
var _ = require('lodash');
var Twilio = require('twilio')

var config = require("../config");
var smsConfig = config.alerts.sms;

var exec = function(alert, alertConfig, e) {
    var deferred = Q.defer();

    var client = Twilio(smsConfig.sId, smsConfig.token);

    client.messages.create({
        body: _.template(alertConfig.body || "", e),
        to: alertConfig.to,
        from: smsConfig.from
    }, function(err, message) {
        if (err) return deferred.reject(err);
        deferred.resolve();
    });

    return deferred.promise;
};

module.exports = {
    id: "sms",
    execute: exec
};
