# Reportr
> "Your life's personal dashboard."

Reportr is a complete application which works like a dashboard for tracking events in your life (using a very simple API). With a simple interface, it helps you track and display your online activity (with trackers for Facebook, Twitter, GitHub, ...) or your real-life activity (with hardware trackers or applications like Runkeeper).

The project is entirely open source and you can host your own Reportr instance on your own server or Heroku.

A simple instance of Reportr runs at [www.reportr.io](http://www.reportr.io). This is a very small instance and you can't use it yet for tracking a lot of events, but I'll probably scale this in the future.

[![Screen](https://raw.github.com/SamyPesse/reportr/master/public/static/images/screens/1.png)](https://raw.github.com/SamyPesse/reportr/master/public/static/images/screens/1.png)

## Why is Reportr great?

* Host your own Reportr instance and keep your data private
* Track events from anywhere (web server, client application, connected hardware, ...)
* It's very simple to track an event: HTTP API
* Simple, but powerful web dashboard
* Realtime display
* One place for all your personal analytics data
* Very simple to export data for analytics (machine learning, ...)

## How to host your own Reportr instance (or run it locally)?

```
# Clone the source code
$ git clone https://github.com/SamyPesse/reportr.git && cd ./reportr

# Edit the config.js file
$ nano ./config.js

# Create your heroku application
$ heroku create

# Add MongoHQ or MongoLab addon for heroku
$ heroku addons:add mongohq:small
or
$ heroku addons:add mongolab:sandbox

# Deploy the application
$ git push heroku master

# Open the application in your browser
$ heroku open
```

Configure using Heroku config vars or define these variables in a **.env** file:

```
# Host name
HOST

# Express Secret session
SESSION_SECRET

# Foursquare oAuth
# Callback url is {HOST}/auth/foursquare/callback
FOURSQUARE_CLIENTID
FOURSQUARE_CLIENTSECRET

# GitHub oAuth
# Callback url is {HOST}/auth/github/callback
GITHUB_CLIENTID
GITHUB_CLIENTSECRET

# Facebook oAuth
# Callback url is {HOST}/auth/facebook/callback
FACEBOOK_CLIENTID
FACEBOOK_CLIENTSECRET

# Twitter oAuth
# Callback url is {HOST}/auth/twitter/callback
TWITTER_CLIENTID
TWITTER_CLIENTSECRET
```

For running it in local, use [foreman from heroku](https://toolbelt.heroku.com/):

```
foreman start
```

For building client and run:

```
# Build and run
make

# or only build
make build
```


## Trackers

Here is a list of trackers, I already built:

* Web Navigation: track web navigation using a Chrome extension
* Instance ping: ping state of the Reportr instance
* Foursquare: track checkins
* GitHub: track coding activity on GitHub
* Facebook: track relations on Facebook (using Realtime API)
* Twitter: track twitter activity (tweets, mentions, ...)

And more to come:

* Runkeeper: track running activity
* Hardware:
	* Track the temperature in a room (using tessel.io)

## APIs

Reportr uses a HTTP REST API to track event and manage models.

Data is always JSON encoded and Base64 encoded and passed as a "*data*" argument. You can pass a "*callback*" arguments for using HTTP API in a client side application.

Python and Javascript libraries for Reportr are in the *examples* directory. To build the Javascript client library, you will need 'browserify' (npm install -g browserify).

#### Track events

Events are defined by 'event', 'namespace' and 'properties'. You can alse specify optional paramaters such as 'id' for updating a unique event if existant or define 'timestamp' to track date & time for the event.

```
<host>/api/<token>/events/track

{
	"namespace": "string", // Event namespace
	"event": "(string)", // Event name
	"properties": {
		// Properties for the event
	}
}
```

#### List events

```
# List last events
<host>/api/<token>/events/last

# List specific events
<host>/api/<token>/events/<namespace>/<event>
```


#### Get data series

```
<host>/api/<token>/data/<namespace>/<event>?arguments

arguments could contains :
interval: Interval between data (in ms) (default: 1000)
period: Period for events (in ms) (default: -1)
property: Property to calculate (default: null)
transform: Transofrmation to do (default: 'sum')
fill: Fill empty time with 0 (default: true)
```

#### Define models

Event models define information about how to display an event in the dashboard.

```
<host>/api/<token>/model/set

{
	"namespace": "string", // Event namespace
	"event": "(string)", // Event name
	"name": "(string)", // Display name for the event
	"icon": "(string)", // Url for a 64x64 icon image
	"description": "(string)", // Description text for the event
}
```

#### List models

```
<host>/api/<token>/models
```

#### Special properties for events

When you track events using the API, you can define some special properties that can be use by Reportr for advanced use. Special properties always begin with '@'.

```
@lat : latitude for location
@lng : longitude for location
```

