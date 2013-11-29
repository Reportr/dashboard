define([
    "hr/hr",
    "api",
    "notifications",
    "collections/reports"
], function(hr, api, notifications, Reports) {
    var User = hr.Model.extend({
        defaults: {
        	'email': null,
        	'token': null,
            'settings': {},
            'trackers': []
        },

        /*
         *  Constructor
         */
        initialize: function() {
            var that = this;
            User.__super__.initialize.apply(this, arguments);

            // Reports list
            this.reports = new Reports();
            this.reports.on("add remove set", function() {
                var settings = that.toJSON().settings;
                settings.reports = that.reports.toJSON();

                that.set("settings", settings);
            }, this);

            // User change
            this.on("change:token", function() {
                this.connectNotifications();
            }, this);

            this.on("set", _.throttle(this.saveSettings, 1000), this);
            
            this.loadSettings();

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
            }).then(function(data) {
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
            }).then(function(data) {
            	that.set(data);
            });
        },

        /*
         *	Log out the user
         */
        logout: function() {
            var that = this;
            return api.request("post", "auth/logout").then(function(data) {
                that.set({
                    'email': null,
                    'token': null,
                    'settings': {},
                    'trackers': []
                })
            });
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
            return api.request("post", "account/save", {
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

            // options
            options = _.defaults(options || {}, {
                'updateReports': true,
                'token': this.get("token")
            })

            // Sync with server
            return api.request("post", "account/get").then(function(data) {
                // Update user
                that.set(data);

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
         *  Get tracker state
         */
        trackerState: function(tId) {
            return _.reduce(this.get("trackers", []), function(memo, tracker) {
                if (tracker.id == tId) {
                    memo = tracker.active;
                }
                return memo
            }, null);
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
            return api.request("post", this.get("token")+"/tracker/"+tId+"/toggle").then(function(data) {
                if (data.url == null) {
                    that.loadSettings().then(function() {
                        that.trigger("trackers:toggle", tId);
                    });                    
                } else {
                    window.location.href = data.url;
                }
            });
        },
    }, {
        current: null
    });

    User.current = new User();
    return User;
});