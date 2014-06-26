define([
    "hr/hr",
    "utils/dialogs",
    "views/visualizations/all"
], function(hr, dialogs, allVisualizations) {
    var Visualization = hr.Model.extend({
        defaults: {
            type: null,
            eventName: null,
            configuration: {}
        },

        initialize: function() {
            Visualization.__super__.initialize.apply(this, arguments);

            this.report = this.collection.report;
        },


        // Open configuration dialogs
        configure: function() {
            var that = this;
            var visu = allVisualizations[this.get("type")];

            return dialogs.fields("Edit", [
                {
                    "title": {
                        'label': "Title",
                        'type': "text"
                    },
                    "size": {
                        'label': "Layout",
                        'type': "select",
                        'options': {
                            'big': "Large",
                            'small': "Normal"
                        }
                    }
                },
                visu.config
            ], this.get("configuration"))
            .then(function(data) {
                that.set("configuration", data);
                return that.report.edit();
            });
        }
    });

    return Visualization;
});