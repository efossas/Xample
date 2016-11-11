/* eslint-env node, es6 */
/*
	Title: Page
	Loads block page in show mode.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');
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
	var uid = request.query.a;
	var pid = request.query.p;

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined' || typeof pid === 'undefined') {
        loader.loadBlockPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
        pool.getConnection(function(err,connection) {
            if(err) {
                analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
            }
			var qry = "SELECT pagename FROM p_" + uid + " WHERE pid=" + pid;

			connection.query(qry,function(err,rows,fields) {
				if(err) {
					response.end('err');
					analytics.journal(true,201,err,uid,analytics.__line,__function,__filename);
				} else {
					/* sql query is undefined if a user tries to edit page with invalid pid */
					if(typeof rows[0] === 'undefined') {
						loader.absentRequest(request,response);
					} else {
						var pagename = rows[0].pagename;

						var qry = "SELECT type,content FROM p_" + uid + "_" + pid;

						connection.query(qry,function(err,rows,fields) {
							if(err) {
								response.end('err');
								analytics.journal(true,202,err,uid,analytics.__line,__function,__filename);
							} else {
								var pagedata = pid + "," + pagename;

								/* i is for accessing row array, j is for keeping track of rows left to parse */
								var i = 0;
								var j = rows.length;

								/* append commas to each row except for the last one */
								if(j > 0) {
									pagedata += ",";
								}
								while(j > 1) {
									pagedata += rows[i].type + "," + rows[i].content + ",";
									i++;
									j--;
								}
								if(j === 1) {
									pagedata += rows[i].type + "," + rows[i].content;
								}

								/* load the edit page with the page data */
								loader.loadBlockPage(request,response,"<script>pageShow('" + pagedata + "');</script>");
								analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
							}
						});
					}
				}
			});
			connection.release();
        });
	}
};
