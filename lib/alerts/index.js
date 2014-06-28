var _ = require("lodash");

var ALL = [
    require("./webhook")
];


module.exports = {
    ALL: ALL,
    TYPES: _.pluck(ALL, "id")
};
