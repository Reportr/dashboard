var path = require("path");
var _ = require("lodash");
var pkg = require("./package.json");

module.exports = function (grunt) {
    // Path to the client src
    var srcPath = path.resolve(__dirname, "public/src");

    // Load grunt modules
    grunt.loadNpmTasks('hr.js');

    // Init GRUNT configuraton
    grunt.initConfig({
        "pkg": pkg,
        "hr": {
            "app": {
                // Base directory for the application
                "base": srcPath,

                // Application name
                "name": "Reportr",

                // Mode debug
                "debug": false,

                // Main entry point for application
                "main": "main",

                // Build output directory
                "build": path.resolve(__dirname, "public/build"),

                // Static files mappage
                "static": {
                    "fonts": path.resolve(srcPath, "resources", "fonts"),
                    "images": path.resolve(srcPath, "resources", "images")
                },

                // Stylesheet entry point
                "style": path.resolve(srcPath, "resources/stylesheets/main.less"),

                // Modules paths
                'paths': {

                },
                "shim": {
                    "main": {
                        "deps": [
                            'hr/dom'
                        ]
                    }
                },
                'args': {},
                'options': {}
            }
        }
    });

    // Build
    grunt.registerTask('build', [
        'hr:app'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
