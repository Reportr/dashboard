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
        template: "reports/count.html",

        /*
         *  Constructor
         */
        initialize: function() {
            ReportCountView.__super__.initialize.apply(this, arguments);

            this.counter = this.report.eventInfo.get("count", 0);
            this.pCounter = this.counter;
            this.speed = 0;

            // From eventinfos
            this.report.eventInfo.on("change", function() {
                this.counter = this.report.eventInfo.get("count");
                this.pCounter = this.counter;
                this.render();
            }, this);

            // New events
            this.report.eventInfo.on("events:new", function() {
                this.counter = this.counter + 1;
                this.render();
            }, this);

            // Interval
            setInterval(_.bind(function() {
                this.speed = (this.counter - this.pCounter)/5;
                this.pCounter = this.counter;
                this.render();
            }, this), 5000)

            return this;
        },

        templateContext: function() {
            return {
                'counter': this.counter,
                'speed': this.speed
            };
        },

        finish: function() {
            ReportCountView.__super__.finish.apply(this, arguments);
            
            return this;
        }
    });

    return ReportCountView;
});