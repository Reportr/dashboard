var _ = require("lodash");

var VALID_CODES = [404, 500, 401];

// Return an error with a specific code
var withCode = function(code, msg) {
    var e = new Error(msg);
    e.code = code;
    return e;
};

// Normalize mongoose error
var normMongooseError = function(err) {
    return _.chain(err.errors || [])
    .map(function(_err) {
        return [
            _err.path,
            {
                message: _err.message
            }
        ];
    })
    .object()
    .extend({
        global: (err.errors? null : err)
    })
    .value();
}

module.exports = {
    withCode: withCode,
    mongooseError: normMongooseError,
    VALID_CODES: VALID_CODES
};
