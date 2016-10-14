/* eslint-env node, es6 */
/*
	Title: Revert
	Route for reverting page to last save.
*/

var analytics = require('./../analytics.js');

/*
	Function: revert

	Copies the temporary table to the permanent table, then sends the rows of data.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.revert = function(request,response) {
	var __function = "revert";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
        response.end('norevertloggedout');
    } else {

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				analytics.journal(true,199,"Overload Attack!",uid,analytics.__line,__function,__filename);
			}
        });

		request.on('end',function() {

			/* save the POST data */
			var POST = qs.parse(body);

			if(typeof POST.pid === 'undefined') {
                response.end('nopid');
            } else {
				var pid = POST.pid;

                pool.getConnection(function(err,connection) {
                    if(err) {
                        analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
                    }

					/* update the page status */
					var qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;

					connection.query(qryStatus,function(err,rows,fields) {
						if(err) {
							response.end('err');
							analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
						} else {

							var qryPageData = "SELECT mediaType,mediaContent FROM p_" + uid + "_" + pid;

							connection.query(qryPageData,function(err,rows,fields) {
								if(err) {
									response.end('err');
									analytics.journal(true,201,err,uid,analytics.__line,__function,__filename);
								} else {
									var pagedata = "";

									/* i is for accessing row array, j is for keeping track of rows left to parse */
									var i = 0;
									var j = rows.length;

									/* append commas to each row except for the last one */
									if(j > 0) {
										pagedata += ",";
									}
									while(j > 1) {
										pagedata += rows[i].mediaType + "," + rows[i].mediaContent + ",";
										i++;
										j--;
									}
									if(j === 1) {
										pagedata += rows[i].mediaType + "," + rows[i].mediaContent;
									}
									response.end(pagedata);
									analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
								}
							});
						}
					});
                    connection.release();
                });
			}
		});
	}
};
