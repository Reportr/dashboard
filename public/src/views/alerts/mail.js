define([
    "hr/utils",
    "utils/i18n"
], function(_, i18n) {
    return {
        title: i18n.t("alerts.types.mail.title"),
        config: {
            to: {
                type: "text",
                label: i18n.t("alerts.types.mail.config.to.label"),
                help: i18n.t("alerts.types.mail.config.to.help")
            }
        }
    };
});