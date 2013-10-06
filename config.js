module.exports =  {
	/* Debug mode */
	"debug": true,

	/* Server configuration */
	"web": {
		/* (string) Hostname for the application */
		"host": "reportr.me",

		/* (boolean) Secure https mode */
		"secure": false,

		/* (int) TCP server port */
		"port": process.env.PORT || 5000
	},

	/* Database configuration */
	"database": {
		"url": process.env.MONGOHQ_URL || 'mongodb://localhost/reportr'
	},

	/* Users configuration */
	"users": {
		/* (int) Max number of users */
		"max": 1000
	},
};