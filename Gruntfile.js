var path = require("path");
var _ = require("lodash");
var pkg = require("./package.json");

module.exports = function (grunt) {
    // Path to the client src
    var srcPath = path.resolve(__dirname, "public/src");

    // Load grunt modules
    grunt.loadNpmTasks('hr.js');
    grunt.loadNpmTasks("grunt-bower-install-simple");

    // Init GRUNT configuraton
    grunt.initConfig({
        "pkg": pkg,
        "bower-install-simple": {
            options: {
                color:       true,
                production:  false,
                directory:   "public/src/vendors"
            }
        },
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

                // HTML entry point
                'index': grunt.file.read(path.resolve(srcPath, "index.html")),

                // Static files mappage
                "static": {
                    "octicons": path.resolve(srcPath, "vendors/octicons/octicons"),
                    "images": path.resolve(srcPath, "resources/images")
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

    // Prepare build
    grunt.registerTask("prepare", [
        "bower-install-simple"
    ]);

    // Build
    grunt.registerTask('build', [
        'hr:app'
    ]);

    grunt.registerTask('default', [
        'prepare',
        'build'
    ]);
};
