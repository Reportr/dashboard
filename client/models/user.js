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
            'settings': {},
            'trackers': []
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

            this.on("set", _.throttle(this.saveSettings, 1000), this);
            
            if (this.isAuth()) {
                console.log("user is logged");
                this.loadSettings();
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
                that.loadSettings({
                    'token': data.token
                });
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
        		'token': null,
                'settings': {},
                'trackers': []
        	})
        	return this;
        },


        /*
         *  Save user settings
         */
        saveSettings: function(options) {
            var that = this;
            if (!this.isAuth()) return this;

            // options
            options = _.defaults(options || {}, {
                
            })

            // Sync with server
            return api.request("post", this.get("token")+"/account/save", {
                'settings': this.get("settings", {})
            }).done(function(data) {
                // Update user
                that.set(data, {
                    silent: true
                });
            });
        },

        /*
         *  Load user settings
         */
        loadSettings: function(options) {
            var that = this;
            if (!this.isAuth()) return this;

            // options
            options = _.defaults(options || {}, {
                'updateReports': true,
                'token': this.get("token")
            })

            // Sync with server
            return api.request("post", options.token+"/account/get").then(function(data) {
                // Update user
                that.set(data);

                // Save email and token
                hr.Storage.set("email", that.get("email", ""));
                hr.Storage.set("token", that.get("token", ""));

                // Update reports
                if (options.updateReports) {
                    that.reports.reset(that.get("settings.reports", []));
                }
            }, function() {
                console.log("fail gettings settings");
                that.logout();
            });
        },

        /*
         *  Toggle tracker
         */
        toggleTracker: function(tId, options) {
            var that = this;
            if (!this.isAuth()) return this;

            // options
            options = _.defaults(options || {}, {
                
            })

            // Sync with server
            return api.request("post", this.get("token")+"/tracker/"+tId+"/toggle").done(function(data) {
                that.loadSettings();
            });
        },
    }, {
        current: null
    });

    User.current = new User();
    return User;
});