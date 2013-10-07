// Requires
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");
var crypto = require('crypto');

var Event = require("./event").Event;
var EventModel = require('./eventmodel').EventModel;

var userSchema = new mongoose.Schema({
    email: {
    	type: String,
    	unique: true
    },
    password: {
        type: String
    },
    token: {
    	type: String,
    	unique: true
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

// Track an event
userSchema.methods.track = function(data) {
    var deferred = Q.defer();

    // Modify data
    data.userId = this.id.toString();
    data.eventId = data.eventId || Date.now().toString();
    data.eventId = this.id.toString()+"/"+data.namespace+"/"+data.event+"/"+data.eventId;

    data.namespace = data.namespace || 'main';
    data.properties = data.properties || {};
    data.timestamp = data.timestamp || Date.now();

    // Track event
    var e = new Event(data);
    var upsertData = e.toObject();
    delete upsertData._id;
    Event.update({
        'eventId': e.eventId
    }, upsertData, {upsert: true}, function(err) {
        if (err) return deferred.reject(err);

        deferred.resolve(e);
    });

    return deferred.promise;
};

// Set model
userSchema.methods.setModel = function(data) {
    var deferred = Q.defer();
    
    data.eventNamespace = data.eventNamespace || 'main';
    data.modelId = this.id.toString()+"/"+data.eventNamespace+"/"+data.eventName;
    data.name = data.name || data.eventName;
    data.userId = this.id.toString();
    data.icon = data.icon || "";
    data.description = data.description || "";

    var e = new EventModel(data);
    var upsertData = e.toObject();
    delete upsertData._id;
    EventModel.update({
        'modelId': e.modelId
    }, upsertData, {upsert: true}, function(err) {
        if (err) return deferred.reject(err);

        deferred.resolve(e);
    });

    return deferred.promise;
};

var User = mongoose.model('User', userSchema);

// Exports
exports.User = User;