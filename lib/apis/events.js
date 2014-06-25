var _ = require("lodash");

var api = require("./api.js");
var Event = require("../models/event");

// Create an event
api.register("post", "events", function(args) {
    return Event.push(args.type, args.properties)
    .then(function(e) {
        return e.repr();
    })
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

