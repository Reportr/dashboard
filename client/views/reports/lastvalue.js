define([
    "hr/hr",
    "api",
    "views/report"
], function(hr, api, Report) { 

    /*
     *  This report visualization display the last value of a property
     */


    var ReportLastValueView = Report.visualization({
        'id': 'lastvalue',
        'name': 'Last value'
    }, {
        className: "report-lastvalue",
        template: "reports/lastvalue.html",
        events: {
            'change .select-property': 'actionSelectProperty',
        },

        /*
         *  Constructor
         */
        initialize: function() {
            ReportLastValueView.__super__.initialize.apply(this, arguments);

            this.value = 0;

            this.report.eventInfo.on("events:new", function(e) {
                this.value = e.get("properties."+this.report.settings.property, 0);
                this.render();
            }, this);

            return this;
        },

        templateContext: function() {
            return {
                'value': this.value,
                'properties': this.report.eventInfo.get("properties"),
                'settings': this.report.settings
            };
        },

        /*
         *  (action) Select property
         */
        actionSelectProperty: function(e) {
            this.report.settings.property = this.$(".select-property").val();
            this.report.saveSettings();
            this.updateChart();
        },
    });

    return ReportLastValueView;
});