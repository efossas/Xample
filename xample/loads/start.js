/* eslint-env node, es6 */
/*
	Title: Start
	Loads base url. (landing or home page)
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');

/*
	Function: start

	Page Index, detects if session exists and either loads landing or user's home page.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.start = function(request,response) {
	var __function = "start";

	/* detect is the user is logged in by checking for a session */
	var logstatus;
	var uid;
	if(request.session.uid) {
		logstatus = "true";
		uid = request.session.uid;
	} else {
		logstatus = "false";
		uid = 0;
	}

	loader.loadPage(request,response,"<script>pageLanding(" + logstatus + ");</script>");
	analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
};
