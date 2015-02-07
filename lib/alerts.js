var _ = require("lodash");

var ALL = [

];


module.exports = {
	add: function(alert) {
		ALL.push(alert);
	},
	all: function() {
		return ALL;
	},
    byId: function(id) {
        return _.find(ALL, function(a) { return a.id == id; });
    }
};
