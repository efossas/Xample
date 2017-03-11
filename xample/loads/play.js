/* eslint-env node, es6 */
/*
	Title: Not Found
	Loads Play Page.
*/

var loader = require('./loader.js');

/*
	Function: play

	Page Play, for playing with Bengine

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.play = function(request,response) {
	loader.loadPlayPage(request,response,"<script>pagePlay();</script>");
};
