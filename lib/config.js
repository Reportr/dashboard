var TESTING = (process.env.TESTING && process.env.TESTING.toLowerCase() === 'true');

var LOCAL_URL = 'mongodb://localhost/' + (TESTING ?
    'reportr_test':
    'reportr'
);

module.exports = {
    'port': process.env.PORT,

    'database': {
        'url': process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGODB_URL || LOCAL_URL
    },

    'auth': {
        'username': process.env.AUTH_USERNAME ,
        'password': process.env.AUTH_PASSWORD
    }
};

