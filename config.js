module.exports =  {
	/* Debug mode */
	"debug": true,

	/* Server configuration */
	"web": {
		/* (string) Hostname for the application */
		"host": process.env.HOST || "www.reportr.io",

		/* (boolean) Secure https mode */
		"secure": false,

		/* (int) TCP server port */
		"port": process.env.PORT || 5000,

		/* (string) Session secret */
		"sessionSecret": process.env.SESSION_SECRET || "sessionSecret",

		/* Use websocket */
		"websocket": true
	},

	/* Database configuration */
	"database": {
		/* (string) Url for mongodb */
		"url": process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/reportr'
	},

	/* Client configuration */
	"client": {
		"map": {
			/* Key for Google Maps API v3 */
			"apiKey": "AIzaSyAAeM47baWKdmKoqWeIuK5bQCxtur6mWm0"
		}
	},

	/* Tasks */
	"tasks": {
		/* (int) Interval between tasks started (in ms) */
		'interval': 1*60*1000
	},

	/* Trackers */
	"trackers": [
		{
			'module': './trackers/chrome',
			'config': {}
		},
		{
			'module': './trackers/foursquare',
			'config': {
				'interval': 6*60*60,
				'clientId': process.env.FOURSQUARE_CLIENTID,
				'clientSecret': process.env.FOURSQUARE_CLIENTSECRET
			}
		},
		{
			'module': './trackers/github',
			'config': {
				'interval': 6*60*60,
				'clientId': process.env.GITHUB_CLIENTID,
				'clientSecret': process.env.GITHUB_CLIENTSECRET
			}
		},
		{
			'module': './trackers/facebook',
			'config': {
				'interval': 6*60*60,
				'clientId': process.env.FACEBOOK_CLIENTID,
				'clientSecret': process.env.FACEBOOK_CLIENTSECRET
			}
		},
		{
			'module': './trackers/ping',
			'config': {
				'interval': 10*60
			}
		}
	]
};