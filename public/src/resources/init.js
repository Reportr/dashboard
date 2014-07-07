define([
    "hr/hr",
    "hr/promise"
], function(hr, Q) {
    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    hr.Resources.addNamespace("i18n", {
        loader: "require",
        base: "resources/langs/",
        extension: ".json"
    });

    return function() {
        return Q();
    };
});