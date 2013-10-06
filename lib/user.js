// Requires
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var uuid = require("uuid");

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

var User = mongoose.model('User', userSchema);

// Exports
exports.User = User;