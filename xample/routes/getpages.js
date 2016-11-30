/* eslint-env node, es6 */
/*
	Title: Get Pages
	Route for retrieving a user's page names.
*/

var analytics = require('./../analytics.js');

/*
	Function: getpages

	Ajax, used to get a list of the user's xample pages. The data given to the http response is a comma-separate string in the following format. pid,pagename, If the user has no pages, an empty string is returned.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getpages = function(request,response) {
	var __function = "getpages";

    var pool = request.app.get("pool");

	/* get the user's id */
	var uid = request.session.uid;

    var qry = "SELECT pid,pagename FROM p_" + uid;

    pool.getConnection(function(err,connection) {
        if(err) {
            analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
        }

		connection.query(qry,function(err,rows,fields) {
			if(err) {
				response.end('err');
				analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			} else {
				var pages = "";

				/* i is for accessing row array, j is for keeping track of rows left to parse */
				var i = 0;
				var j = rows.length;

				/* append commas to each row except for the last one */
				while(j > 1) {
					pages += rows[i].pid + "," + rows[i].pagename + ",";
					i++;
					j--;
				}
				if(j === 1) {
					pages += rows[i].pid + "," + rows[i].pagename;
				}

				response.end(pages);
				analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
		});
        connection.release();
    });
};
