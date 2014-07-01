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
    },

    'tasks': {
        'redis': process.env.REDISCLOUD_URL || process.env.REDIS_URL
    },

    'alerts': {
        'mail': {
            'service': process.env.MAIL_SERVICE,
            'auth': {
                'user': process.env.MAIL_USERNAME,
                'password': process.env.MAIL_PASSWORD
            },
            'from': process.env.MAIL_FROM
        },
        'sms': {
            'sId': process.env.TWILIO_SID,
            'token': process.env.TWILIO_TOKEN,
            'from': process.env.TWILIO_FROM
        }
    }
};

