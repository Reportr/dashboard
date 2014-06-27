define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "leaflet",
    "leaflet.markercluster",
    "utils/template",
    "core/api",
    "views/visualizations/base"
], function(_, $, hr, L, MarkerClusterGroup, template, api, BaseVisualization) {
    L.Icon.Default.imagePath = 'static/leaflet/';

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

            this.map = L.map(this.$map.get(0), {
                zoomControl: false
            });
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.scrollWheelZoom.disable();

            L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-i86knfo3'
            }).addTo(this.map);
        },

        finish: function() {
            var that = this;
            var latLngs = [];
            var tplMessage = that.model.getConf("message") || "<%- $.date(date) %>";

            try {
                // Remove old markers
                if (this.markers) this.map.removeLayer(this.markers);

                // Create new layer
                this.markers = new L.MarkerClusterGroup();
                this.map.addLayer(this.markers);

                // Add marker to layer
                _.each(this.data, function(e) {
                    if (!e.properties.position || !e.properties.position.latitude || !e.properties.position.longitude) return;

                    latLngs.push([
                        e.properties.position.latitude,
                        e.properties.position.longitude
                    ]);

                    var marker = L.marker([
                        e.properties.position.latitude,
                        e.properties.position.longitude
                    ]).bindPopup(template(tplMessage, e));
                    that.markers.addLayer(marker);
                });


                // Fit the map
                var bounds = new L.LatLngBounds(latLngs);
                this.map.fitBounds(this.markers.getBounds());
            } catch (e) {
                console.error(e);
            }

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