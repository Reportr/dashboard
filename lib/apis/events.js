var _ = require("lodash");

var api = require("./api.js");
var Event = require("../models/event");
var queue = require("../queue");

// Create an event
api.register("post", "events", function(args) {
    queue.job("post", args);

    return {
        posted: true
    };
}, {
    needed: [
        "type"
    ]
});

api.register("put", "event/:type/:date", function(args, context) {
    queue.job("update", {
            type : context.type,
            date : context.date,
            properties : args.properties
        }
    );

    return {
        updated: true
    };
}, {
    needed: [
    "type",
    "date"
    ]
});

// List events
api.register("get", "events", function(args) {
    var has = _.chain(args.has.split(",")).compact().value();
    var query = {
        'type': args.type
    };

    if (has.length > 0) {
        query = {
            '$and': _.chain(has)
            .map(function(key) {
                return _.object([["properties."+key, {"$exists": true}]])
            })
            .concat([query])
            .value()
        }
    }

    return Event.find(query)
    .sort({ date:-1 })
    .skip(args.start)
    .limit(args.limit)
    .execQ()
    .then(function(events) {
        return _.map(events, function(e) {
            return e.repr();
        });
    })
}, {
    needed: [
        "type"
    ],
    defaults: {
        start: 0,
        limit: 100,
        has: ""
    }
});

// List events
api.register("get", "types", function(args) {
    return Event.distinctQ('type')
    .then(function(events) {
        return _.chain(events)
        .map(function(e) {
            return {
                type: e
            };
        })
        .value();
    })
});

