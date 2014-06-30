var Alert = require("../models/alert");
var Event = require("../models/event");

module.exports = function(args) {
    return Event.findByIdQ(args.id)
    .then(function(e) {
        return Alert.post(e);
    });
};

