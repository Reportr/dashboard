define([
    "hr/utils",
    "hr/hr",
    "utils/dialogs",
    "utils/i18n"
], function(_, hr, dialogs, i18n) {
    var Settings = hr.Model.extend({
        defaults: {
            language: "en"
        },

        save: function() {
            hr.Storage.set("settings", this.toJSON());
        },
        load: function() {
            this.reset(hr.Storage.get("settings"));
        },

        dialog: function() {
            var that = this;

            return dialogs.fields(i18n.t("settings.title"), {
                "language": {
                    label: i18n.t("settings.language.label"),
                    type: "select",
                    options: _.chain(i18n.translations)
                        .map(function(t, lang) {
                            return [lang, t.language];
                        })
                        .object()
                        .value()
                }
            }, that.toJSON())
            .then(function(data) {
                that.reset(data);
                return that.save();
            });
        }
    });

    var settings = new Settings();
    settings.load();
    return settings;
});