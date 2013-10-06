

chrome.history.onVisited.addListener(function(item) {
	console.log("visit ", item);
	reportr.track("chromeHistory", "visit", {
		"url": item.url,
		"title": item.title
	});
});