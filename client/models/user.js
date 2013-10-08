define([
    "hr/hr",
    "api",
    "notifications",
    "collections/reports"
], function(hr, api, notifications, Reports) {
    var User = hr.Model.extend({
        defaults: {
        	'email': hr.Storage.get("email", ""),
        	'token': hr.Storage.get("token", ""),
            'settings': hr.Storage.get("settings") || {}
        },

        /*
         *  Constructor
         */
        initialize: function() {
            User.__super__.initialize.apply(this, arguments);

            // Reports list
            this.reports = new Reports();
            this.reports.on("add remove set", function() {
                var settings = _.extend({}, this.get("settings", {}), {
                    'reports': this.reports.toJSON()
                });

                this.set("settings", settings);
            }, this);

            // User change
            this.on("change:token", function() {
                this.connectNotifications();
            }, this);

            this.on("set", _.throttle(this.syncSettings, 1000), this);
            
            if (this.isAuth()) {
                console.log("user is logged");
                this.syncSettings({
                    'updateReports': true
                });
            }

            this.connectNotifications();
            return this;
        },

        /*
         *  Connect notifications
         */
        connectNotifications: function() {
            if (this.isAuth()) {
                notifications.subscribe(this.get("token"));
            }
            return this;
        },

        /*
         *	Check if the user is authenticate
         */
        isAuth: function() {
        	return (Boolean(this.get("email", ""))
        		&& Boolean(this.get("token", "")));
        },

        /*
         *	Log in the user
         *	:param email user email address
         *	:param password user password
         */
        login: function(email, password) {
        	var that = this;
        	return api.request("post", "auth/login", {
                'email': email,
                'password': password
            }).done(function(data) {
            	that.set(data);
                this.syncLocal();
                this.reports.reset(this.get("settings.reports", []));
            });
        },

        /*
         *	Sign up the user
         *	:param email user email address
         *	:param password user password
         */
        signup: function(email, password) {
        	var that = this;
        	return api.request("post", "auth/signup", {
                'email': email,
                'password': password
            }).done(function(data) {
            	that.set(data);
            });
        },

        /*
         *	Log out the user
         */
        logout: function() {
            if (!this.isAuth()) return this;
            hr.Storage.clear();
        	this.set({
        		'email': null,
        		'token': null
        	})
        	return this;
        },


        /*
         *  Sync settings
         */
        syncSettings: function(options) {
            var that = this;
            if (!this.isAuth()) return this;

            // options
            options = _.defaults(options || {}, {
                'updateReports': false
            })

            // Sync with server
            return api.request("post", this.get("token")+"/account/sync", {
                'settings': this.get("settings", {})
            }).done(function(data) {
                // Update user
                that.set(data, {
                    silent: true
                });

                // Update reports
                if (options.updateReports) {
                    that.reports.reset(that.get("settings.reports", []));
                }

                that.syncLocal();
            });
        },

        syncLocal: function() {
            // Sync in localStorage
            hr.Storage.set("email", this.get("email", ""));
            hr.Storage.set("token", this.get("token", ""));
            hr.Storage.set("settings", this.get("settings", {}));
        }
    }, {
        current: null
    });

    User.current = new User();
    return User;
});