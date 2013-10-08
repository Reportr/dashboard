define([
    "hr/hr",
    "hr/args",
    "vendors/moment",
    "api",
    "collections/events",
    "views/report"
], function(hr, args, moment, api, Events, Report) { 

    /*
     *  This report visualization display a map with events (need properties $lat and $lng)
     */

    var ReportMapView = Report.visualization({
        'id': 'map',
        'name': 'Map'
    }, {
        className: "report-map",
        template: "reports/map.html",
        events: {
            'change input[type="checkbox"]': 'actionChangeBooleanSettings'
        },
        defaultSettings: {
            'limit': 100,
            'lines': true,
            'markers': true
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportMapView.__super__.initialize.apply(this, arguments);

            // Map
            this.map = null;
            this.previousMarker = null;

            // Collection
            this.collection = new Events({
                'limit': 100,
                'eventName': this.report.eventName,
                'eventNamespace': this.report.eventNamespace
            });
            this.collection.on("add", this.addEventMarker, this);
            this.collection.getSpecific();

            ReportMapView.loadMapApi(_.bind(this.render), this);

            return this;
        },

        finish: function() {
            ReportMapView.__super__.finish.apply(this, arguments);
            
            if (!ReportMapView.apiReady) return this;

            this.map = new google.maps.Map(this.$(".map").get(0), {
                'center': new google.maps.LatLng(51.508742,-0.120850),
                'zoom':2,
                'disableDefaultUI': true,
                'mapTypeId': google.maps.MapTypeId.ROADMAP
            });

            this.collection.each(_.bind(this.addEventMarker, this));

            return this;
        },

        /*
         *  Add an event
         */
        addEventMarker: function(e) {
            var that = this;
            if (this.map == null) return this;

            var lat = e.get("properties.@lat");
            var lng = e.get("properties.@lng");

            if (lat == null || lng == null) return this;

            var position = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({
                'position': position,
                'map': this.map,
                'title': e.get("event")
            });
            google.maps.event.addListener(marker, 'click', function() {
                var infowindow = new google.maps.InfoWindow({
                    'content': moment(e.get("timestamp")).fromNow() + " ("+lat.toFixed(3)+", "+lng.toFixed(3)+")"
                });
                infowindow.open(that.map, marker);
            });

            // Hide marker
            if (!this.report.settings.markers) {
                marker.setMap(null);
            }

            // Draw line
            if (this.report.settings.lines && this.previousMarker) {
                var line = new google.maps.Polyline({
                    path: [
                        this.previousMarker.getPosition(),
                        position
                    ],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                line.setMap(this.map);
            }


            this.previousMarker = marker;

            return this;
        },

        /*
         * (action) Change settings
         */
        actionChangeBooleanSettings: function(e) {
            var p = $(e.currentTarget).attr("value");
            this.report.settings[p] = $(e.currentTarget).is(":checked");
            this.report.saveSettings();
            this.render();
        }
    }, {
        apiLoaded: false,
        apiReady: false,

        /*
         *  Load the google map api
         */
        loadMapApi: function(callback) {
            if (ReportMapView.apiReady) {
                callback();
                return;
            }

            $(window).on("googleMapAPI", callback);

            if (!ReportMapView.apiLoaded) {
                window.gmapInitialize = function() {
                    ReportMapView.apiReady = true;
                    $(window).trigger("googleMapAPI");
                };

                function loadScript() {
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "http://maps.googleapis.com/maps/api/js?key="+args.map.apiKey+"&sensor=false&callback=gmapInitialize";
                    document.body.appendChild(script);
                }

                ReportMapView.apiLoaded = true;
                window.load = loadScript();
            }
        }
    });

    ReportMapView.loadMapApi();

    return ReportMapView;
});