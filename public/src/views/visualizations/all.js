define([
    "views/visualizations/bar",
    "views/visualizations/value",
    "views/visualizations/time",
    "views/visualizations/map"
], function(bar, value, time, map) {

    return {
        'bar': bar,
        'value': value,
        'time': time,
        'map': map
    };
});