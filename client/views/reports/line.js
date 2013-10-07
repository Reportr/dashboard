define([
    "hr/hr",
    "api",
    "models/user",
    "views/report",

    "vendors/jquery.flot",
    "vendors/jquery.flot.time"
], function(hr, api, User, Report) { 

    /*
     *  This report visualization display a line chart
     */

    var ReportLineView = Report.visualization({
        'id': 'line',
        'name': 'Lines'
    }, {
        className: "report-line",
        template: "report.line.html",
        defaultSettings: {
            'limit': 100,
            'transform': 'sum',
            'properties': [null],
            'period': -1,
            'interval': 60*60*1000
        },
        events: {
            'change .select-transform': 'actionSelectTransform',
            'change .select-limit': 'actionSelectLimit',
            'change .select-properties input': 'actionSelectProperty',
            'change .select-interval': 'actionSelectInterval',
            'change .select-period': 'actionSelectPeriod'
        },
        dataTransforms: {
            'sum': 'sum',
            'count': 'count',
            'min': 'min',
            'max': 'max'
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
            '6 Hours': 6*60*60*1000,
            'Day': 24*60*60*1000,
            'Week': 7*24*60*60*1000,
            'Month': 30*24*60*60*1000,
            'Year': 12*30*24*60*60*1000,
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportLineView.__super__.initialize.apply(this, arguments);

            this.chart = null;

            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'transforms': this.dataTransforms,
                'intervals': this.dataIntervals,
                'periods': this.dataPeriods,
                'limits': this.dataLimits,
                'properties': this.report.eventInfo.get("properties"),

                'settings': this.report.settings
            };
        },

        /*
         *  Display graph
         */
        finish: function() {
            ReportLineView.__super__.finish.apply(this, arguments);

            this.chart = $.plot(this.$(".chart"), [], {
                'xaxis': {
                    'mode': 'time'
                }
            });

            return this.updateChart();
        },

        /*
         *  Resize
         */
        resizeChart: function() {
            ReportLineView.__super__.resizeChart.apply(this, arguments);

            if (this.chart != null) {
                this.chart.resize();
                this.chart.setupGrid();
                this.chart.draw();
            }
            return this;
        },

        /*
         *  Events list change : refresh the chart
         */
        updateChart: function() {
            var that = this;
            var series = [];
            var seriesD = [];
            var properties = this.report.settings.properties;

            if (this.chart == null) return this;

            _.each(properties, function(property) {
                var d = this.updateData({
                    'transform': this.dataTransforms[this.report.settings.transform],
                    'property': property,
                    'period': this.report.settings.period,
                    'interval': this.report.settings.interval
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
         *  (action) Select transform
         */
        actionSelectTransform: function(e) {
            this.report.settings.transform = this.$(".select-transform").val();
            this.report.saveSettings();
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
                this.report.settings.properties.push(property);
            } else {
                this.report.settings.properties.remove(property);
            }
            this.report.settings.properties = _.uniq(this.report.settings.properties);
            this.report.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select interval
         */
        actionSelectInterval: function(e) {
            this.report.settings.interval = parseInt(this.$(".select-interval").val());
            this.report.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select interval
         */
        actionSelectLimit: function(e) {
            this.report.settings.limit = parseInt(this.$(".select-limit").val());
            this.report.saveSettings();
            this.updateChart();
        },

        /*
         *  (action) Select period
         */
        actionSelectPeriod: function(e) {
            this.report.settings.period = parseInt(this.$(".select-period").val());
            this.report.saveSettings();
            this.updateChart();
        }
    });

    return ReportLineView;
});