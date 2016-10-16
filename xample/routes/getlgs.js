/* eslint-env node, es6 */
/*
	Title: Get Learning Guides
	Route for retrieving a user's learning guide names.
*/

var analytics = require('./../analytics.js');

/*
	Function: getlgs

	Ajax, used to get a list of the user's learning guides. The data given to the http response is a comma-separate string in the following format. lid,lgname, If the user has no pages, an empty string is returned.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getlgs = function(request,response) {
	var __function = "getlgs";

    var pool = request.app.get("pool");

	/* get the user's id */
	var uid = request.session.uid;

    var qry = "SELECT gid,guidename FROM g_" + uid;

    pool.getConnection(function(err,connection) {
        if(err) {
            analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
        }

		connection.query(qry,function(err,rows,fields) {
			if(err) {
				response.end('err');
				analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
			} else {
				var guides = "";

				/* i is for accessing row array, j is for keeping track of rows left to parse */
				var i = 0;
				var j = rows.length;

				/* append commas to each row except for the last one */
				while(j > 1) {
					guides += rows[i].gid + "," + rows[i].guidename + ",";
					i++;
					j--;
				}
				if(j === 1) {
					guides += rows[i].gid + "," + rows[i].guidename;
				}

				response.end(guides);
				analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
			}
		});
        connection.release();
    });
};
