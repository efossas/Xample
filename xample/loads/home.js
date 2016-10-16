/* eslint-env node, es6 */
/*
	Title: Home
	Loads home page.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');

/*
	Function: home

	Page Home, detects if session exists and either loads home page or landing page.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.home = function(request,response) {
	var __function = "start";

	/* detect is the user is logged in by checking for a session */
	if(request.session.uid) {
		loader.loadPage(request,response,"<script>pageHome();</script>");
		analytics.journal(false,0,"",request.session.uid,analytics.__line,__function,__filename);
	} else {
		response.writeHead(302,{Location:request.root});
		response.end();
	}
};
