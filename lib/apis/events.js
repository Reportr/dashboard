var api = require("./api.js");
var Event = require("../models/event");


// Push an event
api.register("post", "event", function(args) {
    Event.push(args.type, args.properties)
    .then(function() {
        return {
            added: true
        };
    })
}, {
    needed: [
        "type"
    ]
});

// Get events
api.register("get", "events", function(args) {
    return [];
}, {
    needed: [
        "type"
    ]
});

