# Reportr
> "Your life's personal dashboard."

Reportr is a complete application which works like a dashboard for tracking events in your life (using a very simple API). With a simple interface, it can track and show your online activity (with trackers like Fcaebook, Twitter, GitHub, ...) or your real-life activity (with hardware trackers or applications like Runkeeper).

The project is entirely open source and you can host your own Reportr instance on your own server or Heroku.

A simple instance of Reportr runs at [www.reportr.io](http://www.reportr.io). This is a very small instance and you can't use it yet for tracking a lot of events, but I'll probably scale this in the future.

[![Screen](https://raw.github.com/SamyPesse/reportr/master/public/static/images/screens/1.png)](https://raw.github.com/SamyPesse/reportr/master/public/static/images/screens/1.png)

## Why Reportr is great ?

* Host your own Reportr instance and keep your data private
* Track events from anywhere (web server, client application, connected hardware, ...)
* It's very simple to track an event: HTTP API
* Simple, but powerful web dashboard
* Realtime display
* One place for all your personal analytics data
* Very simple to export data for analytics (machine learning, ...)

## How to host your own Reportr instance ?

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

## APIs

Reportr use a HTTP REST API to track event and manage models.

Data are always JSON encoded and Base64 encoded and passed as a "*data*" argument. You can pass a "*callback*" arguments for using HTTP API in a client side application.

You can get some libraries to use Reportr in Python and Javascript in the *examples* directory. To build the Javascript client library, you will need 'browserify' (npm install -g browserify).

#### Track events

Events are definied by 'event', 'namespace' and 'properties'. You can alse specify optional paramaters such as 'id' for updating unique event if existant or 'timestamp' to define time position for the event.

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

#### Define models

Events models define information about how to display an event in the dashboard.

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

When you track events using the API, you can define some specials properties that can be use by Reportr for advanced used. Special properties always begin with '$'.

```
$lat : latitude for location
$lng : longitude for location
```

## Trackers

Here is a list of trackers, I already build or I want to build.

* [done] Web Navigation: track my web navigation using a chrome extension
* Facebook: track my relations on Facebook (using Realtime API)
* GitHub: track my coding activity on GitHub (using GitHub Webhooks)
* Twitter: track my twitter activity (tweets, mentions, ...)
* Runkeeper: track my running activity
* Hardware:
	* Track the temperature in my room (using tessel.io)

#### Track your web navigation

On Google Chrome, opne the extensions settings and add an unpacked extension from the directory *examples/javascript/chrome*.
Define your host and token in the popup and that's it!

Note: For your own reportr instance, you need to modify the *manifest.json* to change the permissions.

