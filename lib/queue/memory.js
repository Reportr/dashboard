var Q = require("q");
var JOBS = {};
var logger = require("../utils/logger")("queue");

// Init
var init = function() {
    logger.log("Init in-process tasks queue");
};

// Create a job handler
var processJob = function(jobId, func) {
    JOBS[jobId] = func;
};

// Create a new task
var createJob = function(jobId, task) {
    if (!JOBS[jobId]) return Q.fail(new Error("Invlid job id"));

    logger.log("Create job", jobId);

    return Q()
    .then(function() {
        return JOBS[jobId](task);
    }, function(err) {
        logger.exception(err, false);
    });
};

module.exports = {
    init: init,
    process: processJob,
    job: createJob,
    worker: false
};
