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
	var uid = request.session.uid;

	if(uid) {
		var userdb = request.app.get("userdb");
		var queryUserDB = require('./../queryuserdb.js');
		var promiseUserData = queryUserDB.getDocByUid(userdb,uid);
		promiseUserData.then(function(data) {
			loader.loadPage(request,response,"<script>pageHome(" + data[0].authority + ");</script>");
			analytics.journal(false,0,"",request.session.uid,global.__stack[1].getLineNumber(),__function,__filename);
		},function(err) {
			loader.loadPage(request,response,"<script>pageHome(0);</script>");
			analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
		});
	} else {
		response.writeHead(302,{Location:request.root});
		response.end();
	}
};
