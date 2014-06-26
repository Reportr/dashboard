// Requires
var Q = require('q');

var config = require('../lib/config');
var database = require('../lib/database');

var clearDB = require('mocha-mongoose')(config.database.url);

// Expose assert globally
global.assert = require('assert');


// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};

// Init before doing tests
before(function(done) {
    qdone(database.init(), done);
});

// Clear before each test
// and build mock data
beforeEach(function(done) {
    qdone(
        Q.nfcall(clearDB)
        .then(function(mockData) {
            // Put mock data in globals
            global.mock = mockData;
        }),
        done
    );
});
