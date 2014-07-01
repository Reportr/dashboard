var Q = require("q");
var _ = require("lodash");
var mongoose = require('mongoose-q')();
var expressions = require("angular-expressions");

var logger = require("../utils/logger")("alerts");
var alerts = require("../alerts");
var queue = require("../queue");

var alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true,
        index: true
    },
    condition: {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        enum: alerts.TYPES,
        require: true
    },
    configuration: {
        type: Object,
        default: {}
    },
    lastTimeRun: {
        type: Date
    }
});


// Methods

// Return a json representation
alertSchema.methods.repr = function() {
    return {
        'id': this.id.toString(),
        'type': this.type,
        'title': this.title,
        'condition': this.condition,
        'configuration': this.configuration,
        'eventName': this.eventName,
        'options': alerts.byId(this.type).options,
        'interval': this.interval
    };
};

// Check an alert condition
alertSchema.methods.validCondition = function(scope) {
    var expr = expressions.compile(this.condition);
    return expr(scope);
};

// Check alert for an event
alertSchema.methods.postEvent = function(e) {
    var Event = mongoose.models.Event;
    var that = this;
    var alert = alerts.byId(this.type);

    return Q()
    .then(function() {
        if (that.lastTimeRun > (Date.now() - that.interval*60*1000)) {
            return Q.fail(new Error("Alert already run in the configurated interval"));
        }

        return Q.all([
            Event.find({
                'type': that.eventName,
                'date': {
                    '$gt': (Date.now() - that.interval*60*1000)
                }
            }).countQ()
        ]);
    })
    .spread(function(COUNT) {
        var context = {
            'COUNT': COUNT,
            'event': e.properties
        };

        if (!that.validCondition(context)) {
            return Q.fail(new Error("Don't respect condition"));
        }

        that.lastTimeRun = new Date();
        return that.saveQ();
    })
    .then(function() {
        logger.log("post alert", that.title);

        queue.job("post", {
            'type': "reportr.alert",
            'properties': {
                'alert': that.id.toString(),
                'type': that.type,
                'eventName': that.eventName
            },
            'date': that.lastTimeRun
        });

        return alert.execute(that, that.configuration, e);
    });
};

// Send an alert
alertSchema.statics.post = function(e) {
    return Alert.find({
        eventName: e.type
    }).execQ()
    .then(function(alerts) {
        return Q.all(_.map(alerts, function(a) {
            return a.postEvent(e)
            .fail(function(err) {
                logger.exception(err, false);
                return Q();
            });
        }));
    });
};


// Model
var Alert = mongoose.model('Alert', alertSchema);

// Exports
module.exports = Alert;
