define([
    "hr/utils",
    "hr/template",
    "moment"
], function (_, hrTemplate, moment) {
    var formatDate = function(d) {
        if (_.isNumber(d)) {
            d = d*1000;
        }

        return moment(new Date(d)).calendar();
    };

    var template = function(s, data) {
        return _.template(s, _.extend({}, data, {
            '$': {
                'date': formatDate
            }
        }));
    };

    hrTemplate.extendContext({
        '$': {
            'date': formatDate,
            'template': template
        }
    });

    return template;
});