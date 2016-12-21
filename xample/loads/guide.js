/* eslint-env node, es6 */
/*
	Title: Page
	Loads block page in show mode.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var loader = require('./loader.js');
var querydb = require('./../querydb.js');

/*
	Function: page

	Page Show Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the author does not have a page with that pid, they will receive "err" in the response. If the author has no media on that page, the user will only receive the pid and pagename.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.guide = function(request,response) {
	var __function = "page";

    var pool = request.app.get("pool");

	/* get the author's id & pid from the get request */
	var aid = request.query.a;
	var pid = request.query.p;

	/* detect is the user is logged in for views */
	var logstatus;
	var uid;
	if(request.session.uid) {
		logstatus = "true";
		uid = request.session.uid;
	} else {
		logstatus = "false";
		uid = 0;
		/* look for cookie from previous visit */
		/// CODE THIS

		/* if no cookie, register ip address instead */
		/// CODE THIS
	}

	/* redirect users if logged out or no page id provided */
	if(typeof aid === 'undefined' || typeof pid === 'undefined') {
        loader.loadLearningGuidePage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
        pool.getConnection(function(err,connection) {
            if(err) {
				loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
                analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
            } else {

				var prefixGuide = helper.getTablePrefixFromPageType('guide');
				var prefixPage = helper.getTablePrefixFromPageType('page');

				var qryGuideContent = "SELECT content FROM " + prefixGuide + "_" + aid + "_" + pid;

				/* query the database */
				connection.query(qryGuideContent,function(err,rows,fields) {
					if(err) {
						err.input = qryGuideContent;
						loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
						analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
					} else if(typeof rows[0] === 'undefined') {
						/// handle empty learning guide
					} else {
						var qryNameImage = "";
						var qryAuthor = "";

						var rowCount = rows.length;
						for(var i = 0; i < rowCount; i++) {
							var list = rows[i];
							var pages = list.content.split('@@');

							var pageCount = pages.length;
							for(var j = 0; j < pageCount; j++) {
								var content = pages[j];
								var ids = content.split('$');

								if(ids[0] !== '') {
									/* pid->0, aid->1 */
									qryNameImage += "(SELECT " + ids[1] + " AS 'uid'," + (i + 1) + " as 'ch',xid,xname,imageurl FROM " + prefixPage + "_" + ids[1] + "_0 WHERE xid=" + ids[0] + ") UNION ";

									qryAuthor += "(SELECT uid,username FROM Users WHERE uid=" + ids[1] + ") UNION ";
								}
							}
						}

						/* slices remove UNION at end */
						var qry = "SELECT authors.uid AS 'aid',ch,xid,xname,username,imageurl FROM (" + qryNameImage.slice(0,-7) + ") AS nameimage JOIN (" + qryAuthor.slice(0,-7) + ") AS authors ON nameimage.uid=authors.uid";

						/* query the database */
						connection.query(qry,function(err,rows,fields) {
							if(err) {
								err.input = qry;
								loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
								analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								if(typeof rows[0] === 'undefined') {
									/// empty set
								} else {
									var pagedata = JSON.stringify(rows);
									loader.loadLearningGuidePage(request,response,"<script>pageShowGuide(" + rowCount + ",'" + pagedata + "');</script>");
									analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
								}
							}
						});
					}
				});
				connection.release();
			}
        });
	}
};
