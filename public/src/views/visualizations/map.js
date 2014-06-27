define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "leaflet",
    "core/api",
    "views/visualizations/base",
    "text!resources/templates/visualizations/map.html"
], function(_, $, hr, L, api, BaseVisualization, template) {
    window.d3 = d3;

    var Visualization = BaseVisualization.extend({
        className: "visualization visualization-map",
        defaults: {},
        events: {},
        template: template,

        finish: function() {
            var map = L.map(this.$('.map').get(0)).setView([51.505, -0.09], 13);

            L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-i86knfo3'
            }).addTo(map);

            return Visualization.__super__.finish.apply(this, arguments);
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

        }
    };
});