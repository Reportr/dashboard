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

// List events
api.register("get", "events", function(args) {
    return Event.find({
        'type': args.type
    })
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
        limit: 100
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

