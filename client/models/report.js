define([
    "hr/hr",
    "underscore"
], function(hr, _) {
    var Report = hr.Model.extend({
        defaults: {
            'id': null,
        	'event': null,
            'namespace': null,
            'settings': {}
        },

        /*
         *  Constructor
         */
        initialize: function() {
            Report.__super__.initialize.apply(this, arguments);

            this.set("id", this.get("id") || _.uniqueId("report_"));
            return this;
        }
    });

    return Report;
});