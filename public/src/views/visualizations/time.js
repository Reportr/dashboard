define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "d3",
    "rickshaw",
    "core/api",
    "utils/i18n",
    "utils/template",
    "views/visualizations/base",
    "text!resources/templates/visualizations/time.html"
], function(_, $, hr, d3, Rickshaw, api, i18n, template, BaseVisualization, templateFile) {
    window.d3 = d3;

    var INTERVALS = ["minute", "hour", "day", "week", "month"];
    var INTERPOLATIONS = ['linear', 'step-after', 'cardinal', 'basis'];

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
                var scale = d3.scale.linear().domain([0, 1]).nice();
                var fieldNames = _.map(this.model.getConf("fields", "").split(","), 
                    function (str) { return str.trim() }
                );
                var series = _.chain(fieldNames).compact().concat([""])
                .map(function(field, i, list) {
                    if (list.length > 1 && !field) return null;

                    return {
                        name: template(tplMessage, {
                            'field': field
                        }),
                        color: '#a6d87a',
                        scale: scale,
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
                    graph: graph,
                    xFormatter: function(x) {
                        return template("<%- $.date(x) %>", {'x': x});
                    }
                });
            } catch(e) {
                console.error(e);
            }

            return TimeVisualization.__super__.finish.apply(this, arguments);
        },

        pull: function() {
            return api.execute("get:stats/time", {
                limit: this.model.getConf("limit"),
                type: this.model.get("eventName"),
                fields: this.model.getConf("fields"),
                interval: this.model.getConf("interval"),
                fillEmpty: this.model.getConf("fillEmpty", false)? "true" : undefined
            });
        }
    });

    return {
        title: i18n.t("visualizations.time.title"),
        View: TimeVisualization,
        config: {
            'fields': {
                'type': "text",
                'label': i18n.t("visualizations.time.config.fields.label"),
                'help': i18n.t("visualizations.time.config.fields.help")
            },
            'limit': {
                'type': "number",
                'label': i18n.t("visualizations.time.config.limit.label"),
                'help': i18n.t("visualizations.time.config.limit.help"),
                'default': 1000,
                'min': 100,
                'max': 1000000
            },
            'interval': {
                'type': "select",
                'label': i18n.t("visualizations.time.config.interval.label"),
                'default': "hour",
                'options': _.chain(INTERVALS). map(function(i) { return [i, i18n.t("visualizations.time.config.interval."+i)] }).object().value()
            },
            'name': {
                'type': "text",
                'label': i18n.t("visualizations.time.config.name.label"),
                'help': i18n.t("visualizations.time.config.name.help")
            },
            'interpolation': {
                'type': "select",
                'label': i18n.t("visualizations.time.config.interpolation.label"),
                'default': "cardinal",
                'options': _.chain(INTERPOLATIONS). map(function(i) { return [i, i18n.t("visualizations.time.config.interpolation."+i)] }).object().value()
            },
            'fillEmpty': {
                'type': "checkbox",
                'label': i18n.t("visualizations.time.config.fillEmpty.label"),
                'help': i18n.t("visualizations.time.config.fillEmpty.help"),
                'default': true
            }
        }
    };
});
