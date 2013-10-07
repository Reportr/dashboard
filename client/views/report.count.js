define([
    "hr/hr",
    "api",
    "views/report"
], function(hr, api, Report) { 

    /*
     *  This report visualization display a simple counter for the number of events
     */


    var ReportCountView = Report.visualization({
        'id': 'count',
        'name': 'Count'
    }, {
        className: "report-count",
        template: "report.count.html",

        /*
         *  Constructor
         */
        initialize: function() {
            ReportCountView.__super__.initialize.apply(this, arguments);

            this.counter = this.report.eventInfo.get("count", 0);

            // From eventinfos
            this.report.eventInfo.on("change", function() {
                this.counter = this.report.eventInfo.get("count");
            }, this);

            // New events
            this.report.eventInfo.on("events:new", function() {
                this.counter = this.counter + 1;
                this.render();
            }, this);

            return this;
        },

        /*
         *  Template context
         */
        templateContext: function() {
            return {
                'counter': this.counter
            };
        },
    });

    return ReportCountView;
});