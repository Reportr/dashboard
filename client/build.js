var path = require("path");
var config = require("../config");

exports.config = {
    // Base directory for the application
    "base": __dirname,

    // Application name
    "name": "Report.me",

    // Mode debug
    "debug": config.debug,

    // Main entry point for application
    "main": "main",

    // Build output directory
    "build": path.resolve(__dirname, "../public"),

    // Static files mappage
    "static": {
        "templates": path.resolve(__dirname, "resources", "templates"),
        "images": path.resolve(__dirname, "resources", "images"),
        "font": path.resolve(__dirname, "resources", "font")
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
        }
    },
    "paths": {
        
    }
};