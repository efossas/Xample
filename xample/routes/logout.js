/* eslint-env node, es6 */
/*
	Title: Log Out
	Route for logging out.
*/

var analytics = require('./../analytics.js');

/*
	Function: logout

	Ajax, handles the log out routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.logout = function(request,response) {
	var __function = "logout";

	/* store the uid for journaling */
	var uid = request.session.uid;

	/* easy enough, regardless of whether the user was logged in or not, destroying the session will ensure log out */
	request.session.destroy();

	/* create response object */
	var result = {msg:"",data:{}};

	result.msg = 'loggedout';
	response.end(JSON.stringify(result));
	analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
	uid = "";
};
