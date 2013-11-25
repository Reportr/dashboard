#!/usr/bin/env node

var _ = require('underscore');
var path = require('path');
var engineer = require('engineer');
var cli = require('commander');
var pkg = require('../package.json');

// Modules
var modulesSection = {
    '*': [
        "./config",
        "./logger",
        "./database",
        "./queue",
        "./notifications",
        "./tasks",
        
        "./trackers",
        "./tracker.chrome",
        "./tracker.facebook",
        "./tracker.foursquare",
        "./tracker.twitter",
        "./tracker.github",
        "./tracker.runkeeper",
        "./tracker.fitbit",
        "./tracker.ping",

        "./model.user",
        "./model.event",
        "./model.eventmodel",
    ],
    'worker': [
        "./worker.main"
    ],
    'web': [
        "./web.api",
        "./web.api.auth",
        "./web.api.data",
        "./web.api.models",
        "./web.api.events",
        "./web.api.trackers",
        "./web.main"
    ],
    'all': [
        "./web.api",
        "./web.api.auth",
        "./web.api.data",
        "./web.api.models",
        "./web.api.events",
        "./web.api.trackers",
        "./web.main",
        "./worker.main"
    ]
};


cli
.command('run')
.description('Run reportr with mode <mode>.')
.action(function() {
    var that = this;

    if (this.mode == null) {
        console.log("Define running mode with option -m (or --mode=<mode>)");
        return;
    }

    if (modulesSection[this.mode] == null) {
        console.log("Invalid mode for running Reportr");
        return;
    }

    var modules = _.union(modulesSection["*"], modulesSection[this.mode]);
    var app = new engineer.Application({
        'paths': [
            path.resolve(__dirname, '..', 'lib')
        ]
    });
    app.on("error", function(err) {
        console.log("Error in the application:");
        console.log(err.stack);
        // Kill process
        process.exit(1);
    });
    return app.load(modules).then(function() {
        return Q(app);
    });
});


cli.option('-m, --mode <web or worker>', 'Run mode for this process.');

cli.version(pkg.version).parse(process.argv);
if (!cli.args.length) cli.help();
