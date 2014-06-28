define([
    "views/visualizations/bar",
    "views/visualizations/table",
    "views/visualizations/value",
    "views/visualizations/time",
    "views/visualizations/map"
], function(bar, table, value, time, map) {

    return {
        'time': time,
        'table': table,
        'bar': bar,
        'value': value,
        'map': map
    };
});