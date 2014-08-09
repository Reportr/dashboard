var Event = require("../models/event");

module.exports = function(args) {
    Event.update(args.type, args.date, args.properties)
    .then(function(e) {
        return e.repr();
    });
};

