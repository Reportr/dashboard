define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "datamaps",
    "utils/template",
    "core/api",
    "views/visualizations/base"
], function(_, $, hr, Datamap, template, api, BaseVisualization) {
    var Visualization = BaseVisualization.extend({
        className: "visualization visualization-map",
        defaults: {},
        events: {},

        initialize: function() {
            Visualization.__super__.initialize.apply(this, arguments);

            this.$map = $("<div>", {
                "class": "map"
            });
            this.$map.appendTo(this.$el);
        },

        prepareMap: function() {
            if (this.map) return;

            this.map = new Datamap({
                element: this.$map.get(0),
                scope: 'world',
                fills: {
                    defaultFill: '#f3f5f9',
                    marker: "#a6d87a"
                },
                geographyConfig: {
                    borderWidth: 1,
                    borderColor: "#e0e4e8",
                    highlightOnHover: false,
                    popupOnHover: false
                }
            });
        },

        finish: function() {
            this.prepareMap();

            var latLngs = [];
            var tplMessage = this.model.getConf("message") || "<%- $.date(date) %>";

            this.map.bubbles(
                _.chain(this.data)
                .map(function(e) {
                    if (!e.properties.position || !e.properties.position.latitude || !e.properties.position.longitude) return null;

                    return {
                        name: template(tplMessage, e),
                        latitude: e.properties.position.latitude,
                        longitude: e.properties.position.longitude,
                        radius: 5,
                        fillKey: 'marker'
                    };
                })
                .compact()
                .value()
            );

            return Visualization.__super__.finish.apply(this, arguments);
        },

        remove: function() {
            this.map.remove();

            return Visualization.__super__.remove.apply(this, arguments);
        },

        pull: function() {
            return api.execute("get:events", {
                type: this.model.get("eventName")
            });
        }
    });

    return {
        title: "Map",
        View: Visualization,
        config: {
            'message': {
                'type': "text",
                'label': "Marker Message",
                'help': "Template for the message, see documentation for more infos about templates."
            }
        }
    };
});