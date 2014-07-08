define([
    "hr/utils",
    "utils/i18n"
], function(_, i18n) {
    return {
        title: i18n.t("alerts.types.webhook.title"),
        config: {
            url: {
                type: "text",
                label: i18n.t("alerts.types.webhook.config.url.label")
            }
        }
    };
});