var _ = require("lodash");

// Transform {a: {b: 1}} -> {"a.b": 1}
var flatten = function(obj, all) {
    var keys= {};
    var getBase = function(base, key) {
        if (_.size(base) == 0) return key;
        return base+"."+key;
    };

    var addKeys = function(_obj, base) {
        var _base, _isObject;
        base = base || "";

        _.each(_obj, function(value, key) {
            _base = getBase(base, key);
            _isObject = _.isObject(value) && !_.isArray(value);

            if (_isObject) addKeys(value, _base);
            if (all == true || !_isObject) keys[_base] = value;
        });
    };

    addKeys(obj);

    return keys;
};

module.exports = {
    flatten: flatten
};
