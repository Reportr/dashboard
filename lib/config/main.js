function setup(options, imports, register) {
    register(null, {
	    'config': {
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
				"websockets": true
			},

			/* Database configuration */
			"database": {
				/* (string) Url for mongodb */
				"url": process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/reportr'
			},

			/* Tasks */
			"tasks": {
				/* (int) Interval between tasks started (in ms) */
				'interval': 5*60*1000
			},

			/* Trackers */
			"trackers": {
				/*{
					'module': 'chrome',
					'config': {}
				},
				{
					'module': 'facebook',
					'config': {
						'interval': 6*60*60,
						'clientId': process.env.FACEBOOK_CLIENTID,
						'clientSecret': process.env.FACEBOOK_CLIENTSECRET
					}
				},
				{
					'module': 'twitter',
					'config': {
						'interval': 6*60*60,
						'clientId': process.env.TWITTER_CLIENTID,
						'clientSecret': process.env.TWITTER_CLIENTSECRET
					}
				},
				{
					'module': 'foursquare',
					'config': {
						'interval': 6*60*60,
						'clientId': process.env.FOURSQUARE_CLIENTID,
						'clientSecret': process.env.FOURSQUARE_CLIENTSECRET
					}
				},
				{
					'module': 'github',
					'config': {
						'interval': 6*60*60,
						'clientId': process.env.GITHUB_CLIENTID,
						'clientSecret': process.env.GITHUB_CLIENTSECRET
					}
				}*/
				'tracker': {
					'interval': 10*60
				}
			}
		}
    });
};

// Exports
module.exports = setup;
