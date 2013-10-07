define([
    "hr/hr",
    "api",
    "models/user",
    "views/events.chart",

    "vendors/jquery.flot",
    "vendors/jquery.flot.time"
], function(hr, api, User, EventsChartView) { 

    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    var EventsChartLineView = EventsChartView.extend({
        className: "events-chart-line",
        template: "events.chart.line.html",
        defaultSettings: {
            'limit': 100,
            'transform': 'sum',
            'properties': [null],
            'period': -1,
            'interval': 60*60*1000
        },
        events: {
            // Actions
            'click .action-toggle-options': 'actionToggleOptions',
            'click .action-report-remove': 'actionReportRemove',

            // Options
            'change .select-transform': 'actionSelectTransform',
            'change .select-limit': 'actionSelectLimit',
            'change .select-properties input': 'actionSelectProperty',
            'change .select-interval': 'actionSelectInterval',
            'change .select-period': 'actionSelectPeriod'
        },
        dataTransforms: {
            'sum': _.sum,
            'count': _.size,
            'min': _.min,
            'max': _.max
        },
        dataPeriods: {
            'Last 10 minutes': 10*60*1000,
            'Last 30 minutes': 30*60*1000,
            'Last hour': 60*60*1000,
            'Last day': 24*60*60*1000,
            'Last week': 7*24*60*60*1000,
            'Last month': 30*24*60*60*1000,
            'Last year': 12*30*24*60*60*1000,
            'All': -1
        },
        dataLimits: [100, 300, 500, 1000, 2000, 10000],
        dataIntervals: {
            'Minute': 60*1000,
            '10 Minutes': 10*60*1000,
            'Hour': 60*60*1000,
            '6 Hours': 60*60*1000,
            'Day': 24*60*60*1000,
            'Week': 7*24*60*60*1000,
            'Month': 30*24*60*60*1000,
            'Year': 12*30*24*60*60*1000,
        },

        /*
         *  Constructor
         */
        initialize: function() {
            EventsChartLineView.__super__.initialize.apply(this, arguments);

            this.chart = null;

            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'model': this.getModel(),
                'event': this.eventInfo,

                'transforms': this.dataTransforms,
                'intervals': this.dataIntervals,
                'periods': this.dataPeriods,
                'limits': this.dataLimits,
                'properties': this.eventInfo.get("properties"),

                'settings': this.settings
            };
        },

        /*
         *  Display graph
         */
        finish: function() {
            EventsChartLineView.__super__.finish.apply(this, arguments);

            this.chart = $.plot(this.$(".chart"), [], {
                'xaxis': {
                    'mode': 'time'
                }
            });

            return this.updateChart();
        },

        /*
         *  Events list change : refresh the chart
         */
        updateChart: function() {
            var that = this;
            var series = [];
            var seriesD = [];
            var properties = this.settings.properties;

            if (this.chart == null) return this;

            _.each(properties, function(property) {
                var d = this.updateData({
                    'transform': this.dataTransforms[this.settings.transform],
                    'property': property,
                    'period': this.settings.period,
                    'interval': this.settings.interval
                });
                d.done(function(data) {
                    series.push({
                        'data': data.data,
                        'label': property || 'Default',
                        'hoverable': true,
                        'clickable': true,
                        'lines': {
                            'show': true
                        },
                        'points': {
                            'show': true
                        },
                        'lines': {
                            'show': true,
                            'fill': true,
                            'fillColor': "rgba(255, 255, 255, 0.8)"
                        }
                    });
                });
                seriesD.push(d);
            }, this);
            
            hr.Deferred.when.apply(null, seriesD).done(function() {
                that.chart.setData(series);
                that.chart.setupGrid();
                that.chart.draw();  
            });

            return this;
        },

        /*
         *  Action toggle options
         */
        actionToggleOptions: function(e) {
            if (e != null) e.preventDefault();
            this.$el.toggleClass("mode-options");
        },

        /*
         *  (action) Select transform
         */
        actionSelectTransform: function(e) {
            this.settings.transform = this.$(".select-transform").val();
            this.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select property
         */
        actionSelectProperty: function(e) {
            var property = $(e.currentTarget).val();
            var checked = $(e.currentTarget).is(":checked");

            if (property == "") property = null;

            if (checked) {
                this.settings.properties.push(property);
            } else {
                this.settings.properties.remove(property);
            }
            this.settings.properties = _.uniq(this.settings.properties);
            this.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select interval
         */
        actionSelectInterval: function(e) {
            this.settings.interval = parseInt(this.$(".select-interval").val());
            this.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select interval
         */
        actionSelectLimit: function(e) {
            this.settings.limit = parseInt(this.$(".select-limit").val());
            this.saveSettings();
            //this.updateData();
        },

        /*
         *  (action) Select period
         */
        actionSelectPeriod: function(e) {
            this.settings.period = parseInt(this.$(".select-period").val());
            this.saveSettings();
            this.updateChart();
        }
    });

    hr.View.Template.registerComponent("events.chart.line", EventsChartLineView);

    return EventsChartLineView;
});