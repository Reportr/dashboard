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

        // Delete this report
        remove: function() {
            var that = this;
            return api.execute("delete:alert/"+this.get("id"))
            .then(function() {
                that.destroy();
            });
        },

        // Toggle alert
        toggle: function() {
            var that = this;

            return api.execute("put:alert/"+this.get("id")+"/toggle")
            .then(function(_data) {
                that.set("enabled", _data.enabled);
                return that;
            });
        },

        // Return details about the type of alert
        type: function() {
            var that = this;
            return api.execute("get:alerts/types")
            .then(function(alertTypes) {
                var alertType = _.find(alertTypes, { id: that.get("type") })
                if (!alertType) throw "Invalid alert type";
                return alertType;
            });
        },

        // Open configuration dialogs
        configure: function() {
            var that = this;

            return that.type()
            .then(function(alertType) {
                return dialogs.fields("Edit", [
                    {
                        "title": {
                            'label': "Title",
                            'type': "text"
                        },
                        "condition": {
                            'label': "Condition",
                            'type': "text"
                        }
                    },
                    alertType.options
                ], _.extend({}, this.get("configuration"), {
                    'title': this.get("title"),
                    'condition': this.get("condition")
                }));
            })
            .then(function(data) {
                that.set("title", data.title);
                that.set("condition", data.condition);
                that.set("configuration", _.omit(data, "title", "condition"));
                return that.edit();
            });
        }
    });

    return Alert;
});