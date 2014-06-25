var _ = require("lodash");

var api = require("../api.js");
var Event = require("../../models/event");


// List events
api.register("get", "stats/categories", function(args) {
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
             '$group': {
                '_id': _.object([["k", "$"+"properties."+args.field]]),
                'n': _.object([["$"+args.func, args.arg]])
            }
        }
    )
    .then(function(results) {
        var max = _.chain(results).pluck("n").max().value();
        var total = _.chain(results).reduce(function(sum, r) { return sum + r.n; }, 0).value()

        return _.chain(results)
        .map(function(r) {
            return {
                'key': r._id.k,
                'value': r.n,
                'percents': {
                    'total': (total > 0 ? ((r.n*100)/total): 0),
                    'max': (max > 0 ? ((r.n*100)/max): 0)
                }
            }
        })
        .sortBy("value")
        .value();
    })
}, {
    needed: [
        "type", "field"
    ],
    defaults: {
        start: 0,
        limit: 100,
        func: "sum",
        arg: 1
    }
});

