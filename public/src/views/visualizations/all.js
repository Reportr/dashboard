define([
    "views/visualizations/bar",
    "views/visualizations/value",
    "views/visualizations/time"
], function(bar, value, time) {

    return {
        'bar': bar,
        'value': value,
        'time': time
    };
});