var _ = require("lodash");

var ALL = [

];


module.exports = {
	all: function() {
		return ALL;
	},
    byId: function(id) {
        return _.find(ALL, function(a) { return a.id == id; });
    }
};
