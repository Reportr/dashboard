// Requires
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");
var crypto = require('crypto');

var notify = require("../notifications").notify;

var Event = require("./event").Event;
var EventModel = require('./eventmodel').EventModel;

var userSchema = new mongoose.Schema({
    email: {
    	type: String,
    	unique: true,
        index: true
    },
    password: {
        type: String
    },
    token: {
    	type: String,
    	unique: true,
        index: true
    },
    settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    trackers: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

// Return user by token
userSchema.statics.getByToken = function(token) {
    var deferred = Q.defer();

    this.model('User').findOne({
        'token': token
    }, function(err, user) {
        if (user) return deferred.resolve(user);
        deferred.reject(err);
    });

    return deferred.promise;
};

// Return user by email
userSchema.statics.getByEmail = function(email) {
    var deferred = Q.defer();

    this.model('User').findOne({
        'email': email
    }, function(err, user) {
        if (user) return deferred.resolve(user);
        deferred.reject(err);
    });

    return deferred.promise;
};

// Sign in an user
userSchema.statics.signIn = function(email, password) {
    var deferred = Q.defer();

    password = crypto.createHash('md5').update(password).digest("hex").toString();

    var user = new User({
        'email': email,
        'password': password,
        'token': uuid.v4()
    });

    user.save(function(err) {
        if (err) deferred.reject(err);
        deferred.resolve(user);
    });

    return deferred.promise;
};

// Log in an user
userSchema.statics.login = function(email, password) {
    var deferred = Q.defer();

    password = crypto.createHash('md5').update(password).digest("hex").toString();

    User.getByEmail(email).then(function(user) {
        if (user.password == password) {
            deferred.resolve(user);
        } else {
            deferred.reject(new Error("Invalid password"));
        }
    }, function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

// Return data to represent an user
userSchema.methods.reprData = function () {
    var trackers = require('../trackers');
    return {
        'email': this.email,
        'token': this.token,
        'settings': this.settings,
        'trackers': _.map(trackers.list, function(tracker) {
            return tracker.reprData(this);
        }, this)
    };
};

// Active/Desactive a tracker
// tId: Tracker ID
// st: state (true or false or undefined)
// next: callback with the next url
userSchema.methods.toggleTracker = function (tId, st, next) {
    var trackers = require('../trackers');
    var tracker = trackers.getById(tId);
    var out = null;

    if (st === undefined) st = !this.hasTracker(tId);
    if (!st && this.trackers[tId] != null) {
        delete this.trackers[tId];
    } else if (st && this.trackers[tId] == null) {
        this.trackers[tId] = {}
        out = tracker.setupUser(this);
    }

    this.markModified('trackers');
    next(out);
    return this;
};

// Check if the user has a tracker active
// tId: Tracker ID
userSchema.methods.hasTracker = function (tId) {
    return this.trackers[tId] != null;
};

// Track an event
userSchema.methods.track = function(data, options) {
    var that = this;
    var deferred = Q.defer();

    // Options
    options = _.defaults(options || {}, {});

    // Check data
    if (!data || !data.name) {
        deferred.reject(new Error("Need 'name' to track an event"));
    } else {
        // Modify data
        data.userId = this.id.toString();
        data.eventId = data.eventId || Date.now().toString();
        data.namespace = data.namespace || 'main';
        data.eventId = this.id.toString()+"/"+data.namespace+"/"+data.name+"/"+data.eventId;        
        data.properties = data.properties || {};
        data.timestamp = data.timestamp || Date.now();

        // Add model if non existant
        this.setModel({
            'eventNamespace': data.namespace,
            'eventName': data.name
        }, {
            'update': false
        });

        // Track event
        var e = new Event(data);
        var upsertData = e.toObject();
        delete upsertData._id;
        Event.update({
            'eventId': e.eventId
        }, upsertData, {upsert: true}, function(err) {
            if (err) return deferred.reject(err);

            // Notify
            notify(that.token, 'event:new', e.reprData());

            // Resolve
            deferred.resolve(e);
        });
    }

    return deferred.promise;
};

// Set model
userSchema.methods.setModel = function(data, options) {
    var that = this;
    var deferred = Q.defer();

    // Options
    options = _.defaults(options || {}, {
        'update': true
    });
    
    // Check data
    if (!data || !data.eventName) {
        deferred.reject(new Error("Need 'eventName' to define a model"));
    } else {
        data.eventNamespace = data.eventNamespace || 'main';
        data.modelId = this.id.toString()+"/"+data.eventNamespace+"/"+data.eventName;
        data.name = data.name || data.eventNamespace+"/"+data.eventName;
        data.userId = this.id.toString();
        data.icon = data.icon || "";
        data.description = data.description || "";

        var next = function(err, model) {
            if (err) return deferred.reject(err);

            // Notify
            notify(that.token, 'model:set', model.reprData());

            // Resolve
            deferred.resolve(model);
        };

        if (options.update) {
            var e = new EventModel(data);
            var upsertData = e.toObject();
            delete upsertData._id;
            EventModel.update({
                'modelId': e.modelId
            }, upsertData, {upsert: true}, function(err) {
                next(err, e);
            });
        } else {
            // Add model if non existant
            EventModel.findOrCreate({
                'modelId': data.modelId
            }, data, next);
        }
    }

    return deferred.promise;
};


// Remove a model and associated events
userSchema.methods.removeModel = function(eventNamespace, eventName) {
    var that = this;
    var deferred = Q.defer();

    // Remove model
    EventModel.findOneAndRemove({
        'userId': this.id.toString(),
        'modelId': this.id.toString()+"/"+eventNamespace+"/"+eventName
    }, function(errModel, nm) {
        // Remove events
        Event.remove({
            'userId': that.id.toString(),
            'event': eventName,
            'namespace': eventNamespace
        }, function(errEvs, n) {
            if (errModel && errEvs) return deferred.reject(errModel);

            // Notify
            notify(that.token, 'model:remove', {
                'event': eventName,
                'namespace': eventNamespace
            });

            // resolve
            deferred.resolve(true);
        });
    });

    return deferred.promise;
};

// Define settings for a tracker
userSchema.methods.setTrackerSettings = function(tId, settings) {
    if (this.trackers[tId] == null) {
        return false;
    }
    this.trackers[tId] = settings;
    this.markModified('trackers');
    return true;
};

// Get settings for a tracker
userSchema.methods.getTrackerSettings = function(tId) {
    return this.trackers[tId];
};

var User = mongoose.model('User', userSchema);

// Exports
exports.User = User;