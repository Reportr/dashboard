define([
    "hr/utils",
    "utils/i18n"
], function(_, i18n) {
    return {
        title: i18n.t("alerts.types.sms.title"),
        config: {
            to: {
                type: "text",
                label: i18n.t("alerts.types.sms.config.to.label"),
                help: i18n.t("alerts.types.sms.config.to.help")
            },
            body: {
                type: "textarea",
                label: i18n.t("alerts.types.sms.config.body.label"),
                help: i18n.t("alerts.types.sms.config.body.help")
            }
        }
    };
});