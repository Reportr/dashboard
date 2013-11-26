require([
    "underscore",
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
            "viewport": "width=device-width, initial-scale=1, user-scalable=no",
            "apple-mobile-web-app-capable": "yes",
            "apple-mobile-web-app-status-bar-style": "black"
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png"),
            "chrome-webstore-item": "https://chrome.google.com/webstore/detail/pignkdodidfdfpmocgffojoihgnnldko",
            "apple-touch-icon-precomposed": hr.Urls.static("images/apple-touch-icon.png")
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
            "click .action-settings": "actionSettings",
            "click .action-toggle-lateralmenu": "actionToggleLateralmenu",
            "click .action-toggle-editmode": "actionToggleEditMode"
        },

        /*
         *  Constructor
         */
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            this.user = User.current;
            this.user.models = new EventModels();
            this.user.on("change:token", this.update, this);

            return this;
        },

        /*
         *  Template rendering context
         */
        templateContext: function() {
            return {
                'user': this.user
            }
        },

        /*
         *  Finish rendering
         */
        finish: function() {
            Application.__super__.finish.apply(this, arguments);
            this.setMode("normal");
            return this;
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
         *  (action) Open settings
         */
        actionSettings: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.components.reports.toggleSettings();
        },

        /*
         *  Set mode
         */
        setMode: function(mode) {
            this.mode = mode;
            this.$el.attr("class", "mode-"+this.mode);
            this.$("*[data-appmode='edit']").toggleClass("active", this.$el.hasClass("mode-edit"));
            this.$("*[data-appmode='normal']").toggleClass("active", !this.$el.hasClass("mode-edit"));
            return this;
        },

        /*
         *  (action) Toggle edit mode
         */
        actionToggleEditMode: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.setMode(this.mode == 'edit' ? 'normal' : 'edit');
        },

        /*
         * (action) Toggle lateral menu
         */
        actionToggleLateralmenu: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.$("#dashboard").toggleClass("mode-lateralbar-close");
        } 
    });

    var app = new Application();
    app.run();
});