/* eslint-env node, es6 */
/*
	Title: Start
	Loads base url. (landing or home page)
*/

var analytics = require('./../analytics.js');
var loader = require('./loader.js');
var queryUserDB = require('./../queryuserdb.js');

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
	if(request.session.uid) {
		var uid = request.session.uid;

		var userdb = request.app.get("userdb");

		var promiseUser = queryUserDB.getDocByUid(userdb,uid);
		promiseUser.then(function(res) {
			var bookmarks = res[0].bookmarks;
			response.cookie('bm',bookmarks);

			loader.loadPage(request,response,"<script>pageLanding(true);</script>");
			analytics.journal(false,0,"",0,global.__stack[1].getLineNumber(),__function,__filename);
		});
	} else {
		loader.loadPage(request,response,"<script>pageLanding(false);</script>");
		analytics.journal(false,0,"",0,global.__stack[1].getLineNumber(),__function,__filename);
	}
};
