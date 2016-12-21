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
	var sort = request.query.sort;
	var tags = request.query.tags;
	var keywords = request.query.keywords;

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
		pool.getConnection(function(err,connection) {
			if(err) {
				loader.loadPage(request,response,"<script>pageError('dberror');</script>");
				analytics.journal(true,220,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			} else {
				/* if coming from the main page, neither sort nor tags are defined */
				if(!sort) {
					sort = "views";
				}
				if(!tags) {
					tags = '0';
				}
				if(!keywords) {
					keywords = "";
				}

				var promise = querydb.searchPageResults(connection,content,subject,category,topic,sort,tags,keywords);

				promise.then(function(data) {
					/* convert array into string */
					var exploredata = JSON.stringify(data);

					/* create content subject category topic tags array as string, doing it this way to avoid nulls */
					var csctArray = [content,subject,category,topic,sort,tags,keywords];
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
