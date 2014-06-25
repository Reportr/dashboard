var api = require("./api.js");

require("./info.js");
require("./events.js");
require("./reports.js");
require("./report.js");
require("./stats/categories.js");

module.exports = {
    init: api.init
};
