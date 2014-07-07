define([
    "hr/hr",
    "hr/promise",

    // Load locals
    "text!resources/langs/en.json"
], function(hr, Q, en) {
    var translations = {
        "en": en
    };

    hr.I18n.translations = _.transform(translations, function(result, content, key) {
        result[key] = eval('('+content+')');
    });
    hr.I18n.locales = _.keys(hr.I18n.translations);

    return hr.I18n;
});