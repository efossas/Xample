/* eslint-env node, es6 */
/*
	Title: Page
	Loads block page in show mode.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var loader = require('./loader.js');
var queryPageDB = require('./../querypagedb.js');

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
	var cachedb = request.app.get("cachedb");

	/* get the author's id & pid from the get request */
	var aid = request.query.a;
	var pid = request.query.p;
	var menuToggle = request.query.m;

	/* detect is the user is logged in for views */
	var uid;
	var logstatus = false;
	if(request.session.uid) {
		uid = request.session.uid;
		logstatus = true;
	} else {
		uid = 0;
	}

	var body = '';
	request.on('data',function(data) {
		body += data;

		/* prevent overload attacks */
		if (body.length > 1e6) {
			request.connection.destroy();
			var errmsg = {message:"Overload Attack!"};
			analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
		}
	});

	/* redirect users if logged out or no page id provided */
	if(typeof aid === 'undefined' || typeof pid === 'undefined') {
        loader.loadBlockPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
		request.on('end',function() {
			pool.getConnection(function(err,connection) {
				if(err) {
					loader.loadBlockPage(request,response,"<script>pageError('dberr');</script>");
					analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				} else {
					var prefix = helper.getTablePrefixFromPageType('page');

					var promiseSettings = queryPageDB.getPageSettings(connection,prefix,aid,pid);

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
							pageSettings['author'] = pageSettings['username'];
							delete pageSettings['username'];

							pageSettings['aid'] = aid;

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

									helper.determineView(request,response,'page',cachedb,uid,aid,pid);

									/* load the edit page with the page data */
									loader.loadBlockPage(request,response,"<script>pageShow(" + logstatus + "," + mToggle + ",'" + pagedata + "'," + pageinfo + ");</script>");
									analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
								}
							});
						}
					});
					connection.release();
				}
			});
        });
	}
};
