var config = require("../config");

if (config.tasks.redis) {
    module.exports = require("./kue");
} else {
    module.exports = require("./memory");
}
