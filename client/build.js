var path = require("path");

exports.config = {
    // Base directory for the application
    "base": __dirname,

    // Application name
    "name": "Report",

    // Mode debug
    "debug": true,

    // Main entry point for application
    "main": "main",

    // Build output directory
    "build": path.resolve(__dirname, "../public"),

    // Static files mappage
    "static": {
        "templates": path.resolve(__dirname, "resources", "templates"),
        "images": path.resolve(__dirname, "resources", "images"),
        "fonts": path.resolve(__dirname, "resources", "fonts")
    },

    // Stylesheet entry point
    "style": path.resolve(__dirname, "stylesheets/main.less"),

    // paths and shim
    "shim": {
        'vendors/socket.io': {
            exports: 'io'
        },
        'vendors/moment': {
            exports: 'moment'
        },
        'views/views': {
            deps: ['vendors/bootstrap/dropdown']
        }
    },
    "paths": {
        
    },

    // Config and args
    "args": {
        "map": {
            /* Key for Google Maps API v3 */
            "apiKey": process.env.GMAP_APIKEY
        }
    }
};