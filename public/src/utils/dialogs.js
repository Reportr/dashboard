define([
    "hr/promise",
    "hr/dom",
    "hr/hr",
    "views/dialogs/base"
], function (Q, $, hr, DialogView) {
    var Dialogs = {
        /**
         * Open a dialog from a specific view class with some configuration
         *
         * @param {DialogView} cls dialog view class
         * @param {options} options dialog view constructor options
         * @return {promise}
         */
        open: function(cls, options) {
            var d = Q.defer();

            cls = cls || DialogView;
            var diag = new cls(options);

            diag.once("close", function(result, e) {
                if (result != null) {
                    d.resolve(result);
                } else {
                    d.reject(result);
                }
            });
            setTimeout(function() {
                d.notify(diag);
            }, 1);
            diag.update();

            return d.promise;
        },

        /**
         * Open a form modal dialog with different field inputs
         *
         * @param {object} fields map of fields (standard with settings fields)
         */
        fields: function(title, sections, values, options) {
            if (!_.isArray(sections)) sections = [sections];

            var fields = _.reduce(sections, function(prev, value) { return _.merge(prev, value); }, {});

            return Dialogs.open(null, _.defaults(options || {}, {
                "title": title,
                "sections": sections,
                "values": values || {},
                "dialog": "fields",
                "autoFocus": true,
                "valueSelector": function(that) {
                    var data = {};

                    var selectors = {
                        'text': function(el) { return el.val(); },
                        'password': function(el) { return el.val(); },
                        'textarea': function(el) { return el.val(); },
                        'number': function(el) { return el.val(); },
                        'select': function(el) { return el.val(); },
                        'checkbox': function(el) { return el.is(":checked"); },
                        'action': function(el)  { return null; }
                    };

                    _.each(fields, function(field, key) {
                        var v = selectors[field.type](that.$("*[name='"+ key+"']"));
                        if (v !== null) data[key] = v;
                    });
                    return data;
                }
            }));
        },

        /**
         * Open a prompt modal dialog
         *
         * @param {string} title
         * @param {string} message
         * @param {string} defaultmsg
         */
        prompt: function(title, message, defaultmsg) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "prompt",
                "default": defaultmsg,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /**
         * Open a select modal dialog
         *
         * @param {string} title
         * @param {string} message
         * @param {object} choices
         * @param {string} defaultChoice
         */
        select: function(title, message, choices, defaultChoice) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "select",
                "default": defaultChoice,
                "choices": choices,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /**
         * Open a confirmation modal dialog
         *
         * @param {string} title
         * @param {string} message
         */
        confirm: function(title, message) {
            if (!message) {
                message = title;
                title = null;
            }

            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "confirm"
            });
        },

        /**
         * Open an alert modal dialog
         *
         * @param {string} title
         * @param {string} message
         */
        alert: function(title, message) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "alert"
            });
        },

        /**
         * Show an error message
         */
        error: function(err) {
            Dialogs.alert("Error:", err.message || err);
            console.error(err.stack || err.message || err);
            return Q.reject(err);
        }
    };

    return Dialogs;
});