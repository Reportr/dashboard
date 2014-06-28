define([
    "hr/utils",
    "hr/template"
], function (_, hrTemplate) {
    var formatDate = function(d) {
        if (_.isNumber(d)) {
            d = d*1000;
        }

        return (new Date(d)).toUTCString()
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