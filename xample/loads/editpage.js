/* eslint-env node, es6 */
/*
	Title: Edit Page
	Loads block page in edit mode.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: editpage

	Page Edit Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the user does not have a page with that pid, they will receive "err" in the response. If the user has no media on that page, the user will only receive the pid and pagename.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.editpage = function(request,response) {
	var __function = "editpage";

    var pool = request.app.get("pool");

	/* get the user's id, getting it from the session ensures user's can edit other users pages */
	var uid = request.session.uid;

	/* get the pid from the get request */
	var pid = request.query.page;

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined' || typeof pid === 'undefined') {
        loader.loadBlockPage(request,response,"<script>pageError('noeditloggedout');</script>");
    } else {

		/* get table identifier */
		var temp = request.query.temp;

		/* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
		var tid;
		var searchstatus;

		if(temp === "true") {
			tid = "t_";
			searchstatus = false;
		} else if (temp === "false") {
			tid = "p_";
			searchstatus = false;
		} else {
			tid = "p_";
			searchstatus = true;
		}

        pool.getConnection(function(err,connection) {
            if(err) {
                analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
            }

            var promise = querydb.searchPageStatus(connection,uid,pid);

            promise.then(function(success) {
                if(searchstatus && success === 0) {
                    /* load the edit page with the page data */
                    loader.loadBlockPage(request,response,"<script>pageChoose('" + pid + "');</script>");
                } else {

					var promiseSettings = querydb.getPageSettings(connection,uid,pid);

					promiseSettings.then(function(pageSettings) {
						if(pageSettings === -1) {
							response.end('err');
							analytics.journal(true,201,'getPageSettings()',uid,analytics.__line,__function,__filename);
						} else {
							var pageinfo = JSON.stringify(pageSettings);

							var qry = "SELECT type,content FROM " + tid + uid + "_" + pid;

							connection.query(qry,function(err,rows,fields) {
								if(err) {
									response.end('err');
									analytics.journal(true,202,err,uid,analytics.__line,__function,__filename);
								} else {
									var pagedata = "";

									/* i is for accessing row array, j is for keeping track of rows left to parse */
									var i = 0;
									var j = rows.length;

									/* append commas to each row except for the last one */
									while(j > 1) {
										pagedata += rows[i].type + "," + rows[i].content + ",";
										i++;
										j--;
									}
									if(j === 1) {
										pagedata += rows[i].type + "," + rows[i].content;
									}

									/* load the edit page with the page data */
									loader.loadBlockPage(request,response,"<script>pageEdit('" + uid + "','" + pagedata + "'," + pageinfo + ");</script>");
									analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
								}
							});
						}
					},function(err) {
						response.end('err');
						analytics.journal(true,203,err,uid,analytics.__line,__function,__filename);
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
