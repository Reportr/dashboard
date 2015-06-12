define([
    "resources/init",
    "views/visualizations/bar",
    "views/visualizations/table",
    "views/visualizations/value",
    "views/visualizations/time",
    "views/visualizations/plot",
    "views/visualizations/map"
], function(resources, bar, table, value, time, plot, map) {

    return {
        'time': time,
        'plot': plot,
        'table': table,
        'bar': bar,
        'value': value,
        'map': map
    };
});
