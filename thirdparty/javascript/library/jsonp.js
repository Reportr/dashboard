var request = require('browser-request');

var jsonpNode = function (url, callback) {
	url.replace('callback=?', 'jsonp_callback');
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var jsonpData = body;
	    var json;
	    //if you don't know for sure that you are getting jsonp, then i'd do something like this
	    try
	    {
	       json = JSON.parse(jsonpData);
	    }
	    catch(e)
	    {
	        var startPos = jsonpData.indexOf('({');
	        var endPos = jsonpData.indexOf('})');
	        var jsonString = jsonpData.substring(startPos+1, endPos+1);
	        json = JSON.parse(jsonString);
	    }
	    callback(null, json);
	  } else {
	    callback(error);
	  }
	})
};


if (window != null) {
	window._jsonp_callbacks = {};
}

var jsonpBrowser = function(url, cb) {
	if (window == null) { 
		throw "Works only in browser";
	}
	var id = 'j' + (Math.random() * (1<<30)).toString(16).replace('.', '')
	, script = document.createElement('script')

	window._jsonp_callbacks[id] = function(res) {
	cb && cb(res)
	delete window._jsonp_callbacks[id]
	script.parentNode.removeChild(script)
	}

	script.src = url.replace('callback=?', 'callback=_jsonp_callbacks.' + id)
	document.getElementsByTagName('head')[0].appendChild(script)
};



module.exports = {
	'browser': jsonpBrowser,
	'node': jsonpNode
};