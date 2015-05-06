define([
    "resources/init",
    "views/alerts/mail",
    "views/alerts/sms",
    "views/alerts/webhook"
], function(resources, mail, sms, webhook) {

    return {
        'mail': mail,
        'sms': sms,
        'webhook': webhook
    };
});