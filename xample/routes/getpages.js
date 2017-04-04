/* eslint-env node, es6 */
/*
	Title: Get Pages
	Route for retrieving a user's page names.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');

/*
	Function: getpages

	Ajax, used to get a list of the user's xample pages. The data given to the http response is a comma-separate string in the following format. pid,pagename, If the user has no pages, an empty string is returned.

	1 - Get the form data
	2 - Get the page data
	3 - Format the page data

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getpages = function(request,response) {
	var __function = "getpages";

    var pool = request.app.get("pool");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

    pool.getConnection(function(err,connection) {
        if(err || typeof connection === 'undefined') {
			result.msg = 'err';
			response.end(JSON.stringify((result)));
            analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			return;
        }

		/* get the page type */
		var pagetype = connection.escape(request.query.pt).replace(/'/g,"");

		var prefix = helper.getTablePrefixFromPageType(pagetype);

		/* retrieve page data */
		var qry = "SELECT xid,xname FROM " + prefix + "_" + uid + "_0";
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				result.msg = 'err';
				response.end(JSON.stringify((result)));
				err.input = qry;
				analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			} else {
				var pages = "";

				/* i is for accessing row array, j is for keeping track of rows left to parse */
				var i = 0;
				var j = rows.length;

				/* append commas to each row except for the last one */
				while(j > 1) {
					pages += rows[i].xid + "," + rows[i].xname + ",";
					i++;
					j--;
				}
				if(j === 1) {
					pages += rows[i].xid + "," + rows[i].xname;
				}

				result.msg = 'success';
				result.data.pages = pages;
				response.end(JSON.stringify(result));
				analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
		});
        connection.release();
    });
};
