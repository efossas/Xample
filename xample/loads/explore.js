/* eslint-env node, es6 */
/*
	Title: Edit Page
	Loads block page in edit mode.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: explore

	Shows a page with links to pages

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.explore = function(request,response) {
	var __function = "explore";

    var pool = request.app.get("pool");

	/* get the user's id, getting it from the session ensures user's can edit other users pages */
	var uid = request.session.uid;

	/* get the pid from the get request */
	var content = request.query.content;
	var subject = request.query.subject;
	var category = request.query.category;
	var topic = request.query.topic;

	/* redirect users if logged out or no page id provided */
	if(!content && !subject) {
		loader.loadPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {

		var logstatus;
		if(uid) {
			logstatus = "true";
		} else {
			logstatus = "false";
		}

		var exploredata;

		loader.loadPage(request,response,"<script>pageExplore(" + logstatus + ",'" + exploredata + "');</script>");
	}
};
