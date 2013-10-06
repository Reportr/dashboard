define([
    "Underscore",
    "hr/hr"
], function(_, hr) {
    return {
        /*
         *  Execute a request
         *
         *  @param mode : mode "get", "post", "getJSON", "put", "delete"
         *  @param method : url for the request
         *  @args : args for the request
         */
        request: function(mode, method, args, options) {
            var d = new hr.Deferred();
            hr.Requests[mode]("/api/"+method, args, options).then(function(o) {
                d.resolve(JSON.parse(o));
            }, function(err) {
                d.reject(err);
            });

            return d;
        },
    };
});