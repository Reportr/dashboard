define([
    "hr/hr",
    "utils/dialogs",
    "core/api"
], function(hr, dialogs, api) {
    var Alert = hr.Model.extend({
        defaults: {
            type: null,
            eventName: null,
            configuration: {},
            options: {}
        },

        initialize: function() {
            Alert.__super__.initialize.apply(this, arguments);
        },

        // Update alert
        edit: function(data) {
            var that = this;
            data = data || this.toJSON();

            return api.execute("put:alert/"+this.get("id"), data)
            .then(function(_data) {
                that.set(_data);
                return that;
            });
        },

        // Open configuration dialogs
        configure: function() {
            var that = this;

            return dialogs.fields("Edit", [
                {
                    "title": {
                        'label': "Title",
                        'type': "text"
                    }
                },
                this.get("options")
            ], this.get("configuration"))
            .then(function(data) {
                that.set("configuration", data);
                return that.edit();
            });
        }
    });

    return Alert;
});