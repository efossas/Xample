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
exports.page = function(request,response) {
	var __function = "page";

    var pool = request.app.get("pool");

	/* get the author's id & pid from the get request */
	var aid = request.query.a;
	var pid = request.query.p;
	var menuToggle = request.query.m;

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
        loader.loadBlockPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
        pool.getConnection(function(err,connection) {
            if(err) {
				loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
                analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
            } else {
				var prefix = helper.getTablePrefixFromPageType('page');

				var promiseSettings = querydb.getPageSettings(connection,prefix,uid,pid);

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

						var qry = "SELECT type,content FROM " + prefix + "_" + aid + "_" + pid;

						connection.query(qry,function(err,rows,fields) {
							if(err) {
								loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
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

								/* toggles the menu on or off */
								var mToggle = 'true';
								if(menuToggle === 'false') {
									mToggle = 'false';
								}

								/* load the edit page with the page data */
								loader.loadBlockPage(request,response,"<script>pageShow(" + mToggle + ",'" + uid + "','" + pagedata + "'," + pageinfo + ");</script>");
								analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
							}
						});
					}
				});
				connection.release();
			}
        });
	}
};
