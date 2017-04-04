/* eslint-env node, es6 */
/*
	Title: Edit Page
	Loads block page in edit mode.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var loader = require('./loader.js');
var querypagedb = require('./../querypagedb.js');

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

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined') {
        loader.loadPage(request,response,"<script>pageLanding(false);</script>");
    } else {
		/* get table identifier */
		var temp = request.query.temp;

		/* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
		var tid;
		var searchstatus;

		if(temp === "true") {
			tid = 't';
			searchstatus = false;
		} else if (temp === "false") {
			tid = 'p';
			searchstatus = false;
		} else {
			tid = 'p';
			searchstatus = true;
		}

		var prefix = helper.getTablePrefixFromPageType('page');

        pool.getConnection(function(err,connection) {
            if(err || typeof connection === 'undefined') {
				loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
                analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
            } else {
				/* get the pid from the get request */
				var pid = connection.escape(request.query.page).replace(/'/g,"");

				if(typeof pid === 'undefined') {
					loader.loadBlockPage(request,response,"<script>pageError('badquery');</script>");
				} else {
					var promise = querypagedb.getStatusFromXid(connection,prefix,uid,pid);

					promise.then(function(status) {
						if(searchstatus && status === 0) {
							/* load the edit page with the page data */
							loader.loadBlockPage(request,response,"<script>pageChoose('" + pid + "');</script>");
						} else {

							var promiseSettings = querypagedb.getPageSettings(connection,prefix,uid,pid);

							promiseSettings.then(function(pageSettings) {
								if(pageSettings.err === 'notfound') {
									loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
									analytics.journal(true,201,{message:'getPageSettings()'},uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* change to generic names for front-end bar script */
									pageSettings['id'] = pageSettings['xid'];
									delete pageSettings['xid'];
									pageSettings['name'] = pageSettings['xname'];
									delete pageSettings['xname'];

									var pageinfo = JSON.stringify(pageSettings);

									var qry = "SELECT type,content FROM " + prefix + "_" + uid + "_" + pid + " WHERE bt='" + tid + "'";

									connection.query(qry,function(err,rows,fields) {
										if(err) {
											loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
											err.input = qry;
											analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
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
											analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									});
								}
							},function(err) {
								loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
								analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							});
							connection.release();
						}
					},function(error) {
						loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
						analytics.journal(true,200,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
					});
				}
			}
        });
	}
};
