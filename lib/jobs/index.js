var _ = require("lodash");
var queue = require("../queue");

var JOBS = {
    alert: require("./alert"),
    post: require("./post"),
    update: require("./update")
};

var init = function() {
    _.each(JOBS, function(func, jobId) {
        queue.process(jobId, func);
    });
};

module.exports = {
    init: init
};
