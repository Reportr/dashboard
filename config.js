module.exports =  {
	/* Debug mode */
	"debug": true,

	/* Server configuration */
	"web": {
		/* (string) Hostname for the application */
		"host": "reportr.io",

		/* (boolean) Secure https mode */
		"secure": false,

		/* (int) TCP server port */
		"port": process.env.PORT || 5000
	},

	/* Database configuration */
	"database": {
		"url": process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/reportr'
	},

	/* Client configuration */
	"client": {
		"map": {
			"apiKey": "AIzaSyAAeM47baWKdmKoqWeIuK5bQCxtur6mWm0"
		}
	},

	/* Trackers */
	"trackers": [
		{
			'module': 'tracker/ping',
			'config': {
				'interval': 60*60
			}
		}
	]
};