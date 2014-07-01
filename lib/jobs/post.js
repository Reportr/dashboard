var Event = require("../models/event");

module.exports = function(args) {
    Event.push(args.type, args.properties)
    .then(function(e) {
        return e.repr();
    });
};

