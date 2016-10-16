/* eslint-env node, es6 */
/*
	Title: Edit Learning Guide
	Loads learning guide page in edit mode.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: editlg

	Learning guide Edit Mode, used to get a list of learning guide data for a user's page. The data given to the http response is a comma-separate string in this format (links to block pages are ampersand delimited): listnumber,link&link&etc,listnumber,link&link&etc

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.editlg = function(request,response) {
	var __function = "editlg";

    var pool = request.app.get("pool");

	/* get the user's id, getting it from the session ensures user's can edit other users guides */
	var uid = request.session.uid;

	/* get the gid from the get request */
	var gid = request.query.lg;

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined' || typeof gid === 'undefined') {
        loader.loadPage(request,response,"<script>pageError('noeditloggedout');</script>");
    } else {
		/* get table identifier */
		var temp = request.query.temp;

		/* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
		var tid;
		var searchstatus;

		if(temp === "true") {
			tid = "c_";
			searchstatus = false;
		} else if (temp === "false") {
			tid = "g_";
			searchstatus = false;
		} else {
			tid = "g_";
			searchstatus = true;
		}

        pool.getConnection(function(err,connection) {
            if(err) {
                analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
            }

            var promise = querydb.searchPageStatus(connection,uid,gid);

            promise.then(function(success) {
                if(searchstatus && success === 0) {
                    /* load the edit page with the page data */
                    loader.loadBlockPage(request,response,"<script>pageChoose('" + gid + "');</script>");
                } else {

					var qry = "SELECT guidename FROM g_" + uid + " WHERE gid=" + gid;

					connection.query(qry,function(err,rows,fields) {
						if(err) {
							response.end('err');
							analytics.journal(true,201,err,uid,analytics.__line,__function,__filename);
						} else {
							/* sql query is undefined if a user tries to edit page with invalid gid */
							if(typeof rows[0] === 'undefined') {
								loader.absentRequest(request,response);
							} else {
								var guidename = rows[0].guidename;

								var qry = "SELECT links FROM " + tid + uid + "_" + gid;

								connection.query(qry,function(err,rows,fields) {
									if(err) {
										response.end('err');
										analytics.journal(true,202,err,uid,analytics.__line,__function,__filename);
									} else {
										var guidedata = gid + "," + guidename;

										/* i is for accessing row array, j is for keeping track of rows left to parse */
										var i = 0;
										var j = rows.length;

										/* append commas to each row except for the last one */
										if(j > 0) {
											guidedata += ",";
										}
										while(j > 1) {
											guidedata += rows[i].links + ",";
											i++;
											j--;
										}
										if(j === 1) {
											guidedata += rows[i].links;
										}

										/* load the edit page with the page data */
										loader.loadLearningGuidePage(request,response,"<script>pageEditLG('" + guidedata + "');</script>");
										analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
									}
								});
							}
						}
					});
					connection.release();
				}
			},function(error) {
				response.end('err');
				analytics.journal(true,200,error,uid,analytics.__line,__function,__filename);
			});
        });
	}
};
