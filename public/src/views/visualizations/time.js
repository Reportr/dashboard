define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "d3",
    "rickshaw",
    "core/api",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/time.html"
], function(_, $, hr, d3, Rickshaw, api, template, BaseVisualization, templateFile) {
    window.d3 = d3;

    var TimeVisualization = BaseVisualization.extend({
        className: "visualization visualization-time",
        defaults: {},
        events: {},
        template: templateFile,

        finish: function() {
            try {
                var that = this;
                var tplMessage = that.model.getConf("name") || "<%- (field? field : 'Count') %>";

                // Build series from data
                var series = _.chain(this.model.getConf("fields", "").split(",")).compact().concat([""])
                .map(function(field, i, list) {
                    if (list.length > 1 && !field) return null;

                    return {
                        name: template(tplMessage, {
                            'field': field
                        }),
                        color: 'lightblue',
                        data: _.map(that.data, function(d) {
                            return {
                                x: d.date,
                                y: field? d.fields[field] : d.n
                            };
                        })
                    }
                })
                .compact()
                .value();

                // Build graph
                var graph = new Rickshaw.Graph( {
                    element: this.$('.graph').get(0),
                    renderer: 'line',
                    series: series,
                    interpolation: that.model.getConf("interpolation", "cardinal")
                });
                graph.render();

                // Build hover details
                var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                    graph: graph
                });
            } catch(e) {
                console.error(e);
            }

            return TimeVisualization.__super__.finish.apply(this, arguments);
        },

        pull: function() {
            return api.execute("get:stats/time", {
                type: this.model.get("eventName"),
                fields: this.model.getConf("fields"),
                interval: this.model.getConf("interval")
            });
        }
    });

    return {
        title: "Time Chart",
        View: TimeVisualization,
        config: {
            'fields': {
                'type': "text",
                'label': "Fields",
                'help': "Separated by comas"
            },
            'interval': {
                'type': "select",
                'label': "Interval",
                'default': "hour",
                'options': {
                    "minute": "Minute",
                    "hour": "Hour",
                    "day": "Day",
                    "week": "Week",
                    "month": "Month"
                }
            },
            'name': {
                'type': "text",
                'label': "Name",
                'help': "Template for the hover serie name, see documentation for more infos about templates."
            },
            'interpolation': {
                'type': "select",
                'label': "Interpolation",
                'default': "cardinal",
                'options': {
                    'linear': "Linear - straight lines between points",
                    'step-after': "Step After - square steps from point to point",
                    'cardinal': "Cardinal - smooth curves via cardinal splines (default)",
                    'basis': "Basis - smooth curves via B-splines"
                }
            }
        }
    };
});