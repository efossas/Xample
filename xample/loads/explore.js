/* eslint-env node, es6 */
/*
	Title: Edit Page
	Loads block page in edit mode.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');
var queryPageDB = require('./../querypagedb.js');

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

    var red = request.app.get("red");

	/* get the user's id, getting it from the session ensures user's can edit other users pages */
	var uid = request.session.uid;

	/* get the pid from the get request */
	var content = request.query.content;
	var subject = request.query.subject;
	var category = request.query.category;
	var topic = request.query.topic;
	var sort = request.query.sort;
	var btypes = request.query.btypes;
	var tags = request.query.tags;

	/* redirect users if logged out or no page id provided */
	if(!content && !subject) {
		loader.loadPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
		var logstatus;
		if(uid) {
			logstatus = "true";
		} else {
			logstatus = "false";
			uid = 0;
		}
		red.getConnection(function(err,connection) {
			if(err) {
				loader.loadPage(request,response,"<script>pageError('dberror');</script>");
				analytics.journal(true,220,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			} else {
				/* if coming from the main page, neither sort nor btypes are defined */
				if(!sort) {
					sort = "views";
				}
				if(!btypes) {
					btypes = '0';
				}
				if(!tags) {
					tags = "";
				}

				var promise = queryPageDB.searchPageResults(connection,content,subject,category,topic,sort,btypes,tags);

				promise.then(function(data) {
					/* convert array into string */
					var exploredata = JSON.stringify(data);

					/* create content subject category topic btypes array as string, doing it this way to avoid nulls */
					var csctArray = [content,subject,category,topic,sort,btypes,tags];
					var csctString = "['" + csctArray.join("','") + "']";

					/* finished response */
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					loader.loadPage(request,response,"<script>pageExplore(" + logstatus + "," + csctString + "," + exploredata + ");</script>");

				},function(err) {
					loader.loadPage(request,response,"<script>pageError('queryerror');</script>");
					analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				});
			}
		});
	}
};
