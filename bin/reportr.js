#!/usr/bin/env node

var _ = require('underscore');
var path = require('path');
var architect = require('architect');
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
    var config = architect.resolveConfig(modules, path.resolve(__dirname, '..', 'lib'));
    architect.createApp(config, function(err) {
        if (err) {
            console.error('Error initializing Reportr '+that.mode+' process');
            console.error(err);
            console.error(err.stack);

            // Kill process
            process.exit(1);
        }
    });
});


cli.option('-m, --mode <web or worker>', 'Run mdoe for this process.');

cli.version(pkg.version).parse(process.argv);
