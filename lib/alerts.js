var _ = require("lodash");

var ALL = [

];


module.exports = {
    ALL: ALL,
    TYPES: _.pluck(ALL, "id"),
    byId: function(id) {
        return _.find(ALL, function(a) { return a.id == id; });
    }
};