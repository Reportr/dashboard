define([
    "underscore",
    "hr/hr",
    "q"
], function(_, hr, Q) {
    return {
        /*
         *  Execute a request
         *
         *  @param mode : mode "get", "post", "getJSON", "put", "delete"
         *  @param method : url for the request
         *  @args : args for the request
         */
        request: function(mode, method, args, options) {
            return hr.Requests[mode]("/api/"+method, args, options).then(function(o) {
                return JSON.parse(o);
            });
        },
    };
});