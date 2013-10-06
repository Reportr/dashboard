var Reportr = require("./reportr.js");

var reportr = null;

chrome.history.onVisited.addListener(function(item) {
	if (reportr == null) return;
	console.log("Track visit ", item.url);
	reportr.track("chrome", "visit", {
		"url": item.url,
		"title": item.title
	});
});

var start = function(host, token) {
	if (!host || !token) {
		console.log("Invalid settings ", host, token);
		return;
	}

	console.log("Create reportr client with token ", token);
	reportr = new Reportr(host, token, "node");

	console.log("Add event model");
	reportr.model("chrome", "visit", {
		"icon": "$browser",
		"name": "Web Navigation",
		"description": "Webpages viewed on Google Chrome"
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	console.log("Changes in settings", changes);
	chrome.storage.sync.get(['host', 'token'], function(data) {
		start(data.host, data.token);
	});
});