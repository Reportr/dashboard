require([
    "Underscore",
    "hr/hr",
    "hr/args",

    "vendors/moment",
    
    "models/user",
    "collections/eventmodels",

    "views/views",
    "resources/resources"
], function(_, hr, args, moment, User, EventModels) {
    // Configure hr
    hr.configure(args);
    hr.Template.extendContext({
        'moment': moment,
        'user': User.current
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Reportr",
        template: "main.html",
        metas: {
            "description": "Track your life activity on a single platform.",
            "viewport": "width=device-width, initial-scale=1.0",
            "google-site-verification": "yspAMnHx6_MBalUkZDjyWernbqmv8IOXrxarY1CgT8M"
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png"),
            "chrome-webstore-item": "https://chrome.google.com/webstore/detail/pignkdodidfdfpmocgffojoihgnnldko"
        },
        events: {
            // Homepage
            "submit .form-login": "submitLogin",
            "submit .form-signup": "submitSignup",
            "click .action-login": "actionLogin",
            "click .action-signup": "actionSignup",
            "click .action-logout": "actionLogout",

            // Dashboard
            "keyup #lateralbar .search": "searchModels",
            "click .action-token": "actionGetToken",
            "click .action-settings": "actionSettings"
        },

        /*
         *  Constructor
         */
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            this.user = User.current;
            this.user.models = new EventModels();
            this.user.on("change", this.render, this);

            return this;
        },

        /*
         *  Template rendering context
         */
        templateContext: function() {
            return {
                user: this.user
            }
        },

        /*
         *  Render
         */
        render: function() {
            return Application.__super__.render.apply(this, arguments);
        },

        /*
         *  (submit) Log in
         */
        submitLogin: function(e) {
            var that = this;
            if (e != null) {
                e.preventDefault();
            }

            var email = this.$(".form-login #email").val();
            var password = this.$(".form-login #password").val();

            var error = function() {
                that.$(".form-login .form-group").addClass("has-error");
            };

            if (email.length == 0) {
                error();
                return;
            }

            this.user.login(email, password).fail(error);
            return;
        },

        /*
         *  (submit) Sign up
         */
        submitSignup: function(e) {
            var that = this;
            if (e != null) {
                e.preventDefault();
            }

            var email = this.$(".form-signup #email").val();
            var password = this.$(".form-signup #password").val();
            var confirmPassword = this.$(".form-signup #confirmPassword").val();

            var error = function() {
                that.$(".form-signup .form-group").addClass("has-error");
            };

            if (email.length == 0
            || confirmPassword != password) {
                error();
                return;
            }

           this.user.signup(email, password).fail(error);
            return;
        },

        /*
         *  (action) Show login form
         */
        actionLogin: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.$(".form-login").show();
            this.$(".form-signup").hide();
        },

        /*
         *  (action) Show signup form
         */
        actionSignup: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.$(".form-login").hide();
            this.$(".form-signup").show();
        },

        /*
         *  (action) Log out
         */
        actionLogout: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.user.logout();
        },

        /*
         *  (search) Search models
         */
        searchModels: function(e) {
            var q = $(e.currentTarget).val();
            this.components.models.search(q); 
        },

        /*
         *  (action) Get token
         */
        actionGetToken: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            alert(this.user.get("token"));
        },

        /*
         *  (action) Open settings
         */
        actionSettings: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.components.reports.toggleSettings(true);
        }
    });

    var app = new Application();
    app.run();
});