/* eslint-env node, es6 */
/*
	Title: Begin
	Temporary file for testing React start pages. Loads base url. (landing or home page)
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');

/*
	Function: begin

	Page Index, detects if session exists and either loads landing or user's home page.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.begin = function(request,response) {
	var __function = "begin";

	/* detect is the user is logged in by checking for a session */
	if(request.session.uid) {
		/* user is logged in, display home page */
		loader.loadReact(request,response,"<script>pageHome();</script>");
		analytics.journal(false,0,"",request.session.uid,analytics.__line,__function,__filename);
	} else {
		/* user is not logged in, display landing page */
		loader.loadReact(request,response,"<script>pageLanding();</script>");
		analytics.journal(false,0,"",0,analytics.__line,__function,__filename);
	}
};
