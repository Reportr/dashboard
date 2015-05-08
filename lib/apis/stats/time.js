var _ = require("lodash");

var api = require("../api.js");
var Event = require("../../models/event");

var INTERVALS = {
    'minute': ["year", "month", "dayOfMonth", "hour", "minute"],
    'hour': ["year", "month", "dayOfMonth", "hour"],
    'day': ["year", "month", "dayOfMonth"],
    'week': ["year", "month", "week"],
    'month': ["year", "month"],
    'month': ["year"]
};

var INTERVALS_INT = {
    'minute': 60*1000,
    'hour': 60*60*1000,
    'day': 24*60*60*1000,
    'week': 7*24*60*60*1000,
    'month': 30*24*60*60*1000,
    'month': 365*24*60*60*1000
};

// List events
api.register("get", "stats/time", function(args) {
    if (!INTERVALS[args.interval]) throw "Invalid interval, valids are: "+_.keys(INTERVALS).join(", ");
    var fields = _.compact(_.map(args.fields.split(","),
            function (str) { return str.trim() }
        ));
    var intMs = INTERVALS_INT[args.interval];
    var intS = intMs/1000;

    args.start = Number(args.start || 0);
    args.limit = Number(args.limit || 1000);

    return Event.aggregateQ(
        {
            '$match': {
                'type': args.type
            }
        },
        {
            '$sort': {
                'date': -1
            }
        },
        {   '$skip': args.start  },
        {   '$limit': args.limit  },
        {
            '$project': _.chain([])
            .concat(INTERVALS[args.interval])
            .map(function(s) {
                return [s, _.object([["$"+s,'$date']])];
            })
            .concat([
                ["date", 1]
            ])
            .concat(_.map(fields, function(field) {
                return ["properties."+field, 1]
            }))
            .object()
            .value()
        },
        {
            $group : _.extend({
                _id: _.chain(INTERVALS[args.interval])
                .map(function(s) {
                    return [
                        s,
                        "$"+s
                    ];
                })
                .object().value(),
                n: { $sum: 1 },
                date: { $max: "$date" }
            },
                _.chain(fields)
                .map(function(field) {
                    return [
                        field,
                        _.object([["$"+args.func, "$properties."+field]])
                    ]
                })
                .object()
                .value()
            )
        },
        {
            $sort: {
                date: 1
            }
        }
    )
    .then(function(results) {
        // Normaliza data
        var data = _.chain(results)
        .map(function(r) {

            return {
                date: (Math.floor(r.date.getTime()/intMs)*intMs)/1000,
                n: r.n,
                fields: _.chain(fields)
                .map(function(f) {
                    return [
                        f,
                        Number(r[f])
                    ];
                })
                .object()
                .value()
            }
        })
        .value();

        if (args.fillEmpty != null) {
            data = _.transform(data, function(_data, r, i, original) {
                var next = original[i+1];
                var prev = original[i-1];

                if (prev && (r.date - prev.date) > intS) {
                    _data.push({
                        date: (Math.floor((r.date-intS)/intS)*intS),
                        n: 0,
                        fields: _.chain(fields)
                        .map(function(f) {
                            return [
                                f,
                                0
                            ];
                        })
                        .object()
                        .value()
                    });
                }

                _data.push(r);

                if (next && (next.date - r.date) > intS) {
                    _data.push({
                        date: (Math.floor((r.date+intS)/intS)*intS),
                        n: 0,
                        fields: _.chain(fields)
                        .map(function(f) {
                            return [
                                f,
                                0
                            ];
                        })
                        .object()
                        .value()
                    });
                }
            })
        }

        return data;
    })
}, {
    needed: [
        "type"
    ],
    defaults: {
        start: 0,
        limit: 1000,
        interval: "hour",
        fields: "",
        func: "avg",
        fillEmpty: null
    }
});

