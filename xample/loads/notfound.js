/* eslint-env node, es6 */
/*
	Title: Not Found
	Loads 404 errors.
*/

var loader = require('./loader.js');

/*
	Function: notfound

	Page 404, page not found response.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.notfound = function(request,response) {
	/* 404 page not found */
	response.status(404);
	loader.loadPage(request,response,"<script>pageError('notfound');</script>");
};
