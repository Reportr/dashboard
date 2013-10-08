define([
    "hr/hr",
    "models/report"
], function(hr, Report) {
    var Reports = hr.Collection.extend({
        model: Report,
    });

    return Reports;
});