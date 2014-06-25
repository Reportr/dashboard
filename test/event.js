var Q = require("q");

var Event = require('../lib/models/event');

describe('Event model', function() {
    it('can be saved', function(done) {
        var e = new Event();
        e.type = "test";
        e.date = new Date();
        e.properties = {
            test: 1
        };

        qdone(e.saveQ(), done);
    });
});
