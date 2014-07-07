define([
    "hr/hr",
    "text!resources/langs/en.json"
], function(hr) {

    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    hr.Resources.addNamespace("i18n", {
        loader: "require",
        base: "resources/langs/",
        extension: ".json"
    });

    return function() {
        return hr.I18n.loadLocale(["en"]);
    };
});