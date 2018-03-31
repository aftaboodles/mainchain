'use strict';

var request = require('request');
const URL = 'http://13.126.117.204:8080';
module.exports = {
	call: function(method, url_path, payload, cb){
		var options = {
			method: method,
			url: URL + '' + url_path,
			headers:{
				'Content-Type':'application/json'
			},
			body: JSON.stringify(payload)
		};
		function callback(error, response, body) {
  			if (!error && response.statusCode == 200) {
    			cb(null, JSON.parse(body));
  			} else {
  				cb(error, null);
  			}
		}
		request(options, callback);
	}
}