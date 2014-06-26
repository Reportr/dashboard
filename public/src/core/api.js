define([
    'hr/hr'
], function(hr) {
    var rpc = new hr.Backend({
        prefix: "api"
    });

    rpc.defaultMethod({
        execute: function(args, options, method) {
            options = _.defaults({}, options || {}, {
                dataType: "json",
                options: {
                    'headers': {
                        'Content-type': 'application/json'
                    }
                }
            });

            var parts = method.split(":");
            var httpMethod = parts[0];
            var pathMethod = parts.slice(1).join(":");

            return hr.Requests[httpMethod]("api/"+pathMethod, httpMethod == "get" ? args : JSON.stringify(args), options).then(function(data) {
                return data;
            }, function(err) {
                try {
                    var errContent = JSON.parse(err.httpRes);
                    var e = new Error(errContent.error || err.message);
                    e.code = errContent.code || err.status || 500;
                    return Q.reject(e);
                } catch(e) {
                    return Q.reject(err);
                }
            });
        }
    });

    return rpc;
});