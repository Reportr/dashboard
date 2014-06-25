define([
    "hr/hr",
    "core/api",
    "collections/visualizations"
], function(hr, api, Visualizations) {
    var Report = hr.Model.extend({
        defaults: {
            id: null,
            title: null,
            visualizations: []
        },

        initialize: function() {
            Report.__super__.initialize.apply(this, arguments);

            this.visualizations = new Visualizations();
            this.visualizations.reset(this.get("visualizations"));
            this.listenTo(this.visualizations, "add remove change reset", function() {
                this.set("visualizations", this.visualizations.toJSON(), { silent: true });
            });
            this.listenTo(this, "change:visualizations", function() {
                this.visualizations.reset(this.get("visualizations"));
            });
        },

        // Update a report
        edit: function(data) {
            var that = this;

            return api.execute("put:report/"+this.get("id"), data)
            .then(function(_data) {
                that.set(_data);
                return that;
            });
        }
    });

    return Report;
});