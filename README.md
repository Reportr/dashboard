Reportr
=========

> "Your life's personal dashboard."

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Reportr is a complete application which works like a dashboard for tracking events in your life (using a very simple API). With a simple interface, it helps you track and display your online activity or your real-life activity (with hardware trackers or applications like Runkeeper), some trackers are available on [this organization](https://github.com/Reportr).

The project is entirely open source and you can host your own Reportr instance on your own server or Heroku.

[![Screen Preview](./preview.png)](./preview.png)

## Start your instance

Reportr is really easy to run locally or on heroku-compatible services.

```
$ git clone https://github.com/Reportr/dashboard.git
$ npm install .
```

To run it locally, you should use [foreman](http://ddollar.github.io/foreman/) (configuration can be stored in a [.env file](https://devcenter.heroku.com/articles/config-vars#local-setup)):

```
$ foreman start
```

To deploy it on Heroku:

```
$ heroku config:set MONGODB_URL=mongodb://...
$ heroku config:set AUTH_USERNAME=...
$ heroku config:set AUTH_PASSWORD=...
$ git push heroku master
```

## API and Events

Reportr provides an HTTP REST API to track events. Datas are always JSON encoded.

| Endpoint | HTTP Method | Description | Arguments |
| -------- | ----------- | ----------- | --------- |
| /api/infos | GET | Get informations about this instance |  |
| /api/types | GET | Return all event types |  |
| /api/events | POST | Post a new event | `<string>type`, `<object>properties` |
| /api/events | GET | List all events | `<string>type`, `<int>start(0)`, `<int>limit` |
| /api/stats/categories | GET | Get categorized events stats | `<string>type`,`<string>field` |
| /api/stats/time | GET | Get time stats | `<string>type`,`<string>fields`, `<string>interval`, `<string>func` |
| /api/reports | POST | Create a new report | `<string>title` |
| /api/reports | GET | List all reports |  |
| /api/report/:id | PUT | Update a report | `<string>title`, `<array>visualizations` |
| /api/report/:id | DELETE | Remove a report |  |
| /api/alerts | GET | List all alerts |  |
| /api/alerts | POST | Create an alert | `<string>type`, `<string>eventName`, `<string>condition`, `<string>title` |

#### Special Events

| Name | Description | Properties |
| ---- | ----------- | ---------- |
| reportr.alert | Triggered when an alert is triggered | `<string>type`, `<string>eventName` |


## Configuration

Reportr is configured using environment variables.

| Name | Description |
| ---- | ----------- |
| PORT | Port for running the application, default is 5000 |
| MONGODB_URL | Url for the mongoDB database |
| REDIS_URL | (Optional) Url for a redis database when using worker mode |
| AUTH_USERNAME | Username for authentication |
| AUTH_PASSWORD | Password for authentication |

## Events

An event represent something to monitor at a defined date. For example if I'm monitoring the temperature in my home, I'll post an event `home.temperature` with a property `temp`:

```
$ curl -X POST -H "Content-Type: application/json" --data '{ "type":"home.temperature", "properties": { "temperature": 66 } }' http://localhost:5000/api/events
```

## Visualizations

A visualization is a configured way to show data, for example in a pie, bar chart or time graph.

Visualizations accept templates as most of rendering options. Template are processed using [lodash's _.template method](http://lodash.com/docs#template) with some special functions:

- `$.date(date)`: returns a beautiful date

## Use it programmatically

Reportr can be runned programmitically to use custom alerts and trackers:

```
var reportr = require("reportr");

reportr.configure({
    alerts: [
        // Philips Hue alerts
        {
            alert: require("reportr-alert-hue"),
            config: {

            }
        }
    ],
    trackers: [
        // Philips Hue state trackr
        {
            tracker: require("reportr-tracker-hue"),
            config: {

            }
        }
    ]
});

reportr.start();
```

## Trackers

| Description | Link |
| ---- | ----------- |
| Google Chrome Navigation | https://github.com/Reportr/tracker-googlechrome |
| Home ambient (temperature, humidity, light) | https://github.com/Reportr/tracker-home-ambient |
| Memory and CPU of computer | https://github.com/Reportr/tracker-machine |
| Battery data | https://github.com/hughrawlinson/tracker-machine-battery |

## Alerts

Reportr lets you configure alerts to be triggered when specific condition is valid at a specific interval.

#### Types

| Type | Description | Configuration |
| ---- | ----------- | ------------- |
| webhook | Post an HTTP request to a specific url with the data encoded in the body | |
| mail | Send an email notification | `<string>MAIL_SERVICE`, `<string>MAIL_USERNAME`, `<string>MAIL_PASSWORD`, `<string>MAIL_FROM` |
| sms | Send a text message notification | `<string>TWILIO_SID`, `<string>TWILIO_TOKEN`, `<string>TWILIO_FROM` |

#### Condition

Condition for alerts are really easy to write, for example: `COUNT > 9`, this condition will be valid if at least 10 events have been posted in the alert interval. Conditions can also use the event object, for example: `event.temperature > 80`.

## Scale it

Reportr can easily be scaled on Heroku (and compatibles), use the `REDIS_URL` to enable a task queue between **workers** and **web** processes.
