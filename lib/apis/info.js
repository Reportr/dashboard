var api = require("./api.js");
var pkg = require("../../package.json");

api.register("get", "infos", function() {
    return {
        version: pkg.version
    }
}, {
    auth: false
});
