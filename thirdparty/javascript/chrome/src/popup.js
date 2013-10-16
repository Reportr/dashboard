$(document).ready(function() {
	var startTracking = function(cHost, cToken) {
		cHost = cHost || "http://www.reportr.io";
		cToken = cToken || "";

		// Save in storage
		chrome.storage.sync.set({
			'host': cHost.toString(),
			'token': cToken.toString(),
			'update': Date.now()
		}, function() {
		});

		$("#host").val(cHost);
		$("#token").val(cToken);
	};

	// Load settings
	chrome.storage.sync.get(['host', 'token'], function(data) {
		startTracking(data.host, data.token)
	});

	// Bind settings
	$("#submit").click(function() {
		startTracking($("#host").val(), $("#token").val());
	});
});