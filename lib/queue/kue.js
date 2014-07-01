var Q = require("q");
var kue = require('kue');
var url = require('url');
var logger = require("../utils/logger")("queue");

var jobs;

// Init
var init = function() {
    logger.log("Init redis tasks queue");
    var redisURL = url.parse(config.tasks.redis);

    jobs = kue.createQueue({
        redis: {
            port: redisURL.port,
            host: redisURL.hostname,
            auth: redisURL.auth? redisURL.auth.split(":")[1] : null,
            options: {
                no_ready_check: true
            }
        }
    });
};

// Create a job handler
var processJob = function(jobId, func) {
    jobs.process(jobId, function(job, done){
        Q()
        .then(function() {
            return func(job.data);
        })
        .then(function() {
            done();
        }, function(err) {
            logger.exception(err, false);
            done(err);
        });
    });
};

// Create a new task
var createJob = function(jobId, task) {
    logger.log("Create job", jobId);
    jobs.create(jobId, task).save();
};

module.exports = {
    init: init,
    process: processJob,
    job: createJob,
    worker: true
};
