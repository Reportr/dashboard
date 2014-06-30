var Q = require('q');
var _ = require('lodash');
var nodemailer = require("nodemailer");

var config = require("../config");
var mailConfig = config.alerts.mail;

var exec = function(alert, alertConfig, e) {
    var deferred = Q.defer();

    var transport = nodemailer.createTransport("SMTP", {
        service: mailConfig.service,
        auth: mailConfig.auth
    });

    var content = [
        "Alert Notification for <b>"+alert.eventName+"</b>"
    ].join("<br/>\n");

    transport.sendMail({
        from: mailConfig.from,
        to: alertConfig.to,
        subject: "Reportr - Alert - "+alert.eventName,
        text: "",
        html: content
    }, function(error, response){
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
};



module.exports = {
    id: "mail",
    title: "Mail",
    options: {
        to: {
            type: "text",
            label: "To",
            help: "Addresses separated by commas"
        }
    },
    execute: exec
}