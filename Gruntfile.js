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
                "debug": process.env.DEBUG != null,

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
                            'hr/dom',
                            'vendors/bootstrap/js/carousel',
                            'vendors/bootstrap/js/dropdown',
                            'vendors/bootstrap/js/button',
                            'vendors/bootstrap/js/modal',
                            'vendors/bootstrap/js/affix',
                            'vendors/bootstrap/js/alert',
                            'vendors/bootstrap/js/collapse',
                            'vendors/bootstrap/js/tooltip',
                            'vendors/bootstrap/js/popover',
                            'vendors/bootstrap/js/scrollspy',
                            'vendors/bootstrap/js/tab',
                            'vendors/bootstrap/js/transition'
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
