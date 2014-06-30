var Q = require('q');
var _ = require('lodash');
var nodemailer = require("nodemailer");

var exec = function(alert, config, e) {
    var deferred = Q.defer();

    var transport = nodemailer.createTransport("SMTP", {
        service: config.service,
        auth: {
            user: config.authUser,
            pass: config.authPassword
        }
    });

    var content = [
        "Alert Notification for <b>"+alert.eventName+"</b>"
    ].join("<br/>\n");

    transport.sendMail({
        from: config.from, // sender address
        to: config.to, // list of receivers
        subject: "Reportr - Alert - "+alert.eventName, // Subject line
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
        service: {
            type: "select",
            label: "Service",
            options: {
                "Gmail": "Gmail"
            }
        },
        authUser: {
            type: "text",
            label: "Username"
        },
        authPassword: {
            type: "text",
            label: "Password"
        },
        from: {
            type: "text",
            label: "From"
        },
        to: {
            type: "text",
            label: "To",
            help: "Addresses separated by commas"
        }
    },
    execute: exec
}