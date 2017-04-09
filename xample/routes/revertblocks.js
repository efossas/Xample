/* eslint-env node, es6 */
/*
	Title: Revert
	Route for reverting page to last save.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');

/*
	Function: revert

	Copies the temporary table to the permanent table, then sends the rows of data.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.revertblocks = function(request,response) {
	var __function = "revert";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* create response object */
	var result = {msg:"",data:{}};

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
		result.msg = 'norevertloggedout';
		response.end(JSON.stringify(result));
    } else {
		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				var errmsg = {message:"Overload Attack!"};
				analytics.journal(true,199,errmsg,uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
        });

		request.on('end',function() {
			/* save the POST data */
			var POST = qs.parse(body);

			if(typeof POST.xid === 'undefined') {
				result.msg = 'noxid';
				response.end(JSON.stringify(result));
            } else {
				var xid = POST.xid;
				var pagetype = POST.pagetype;

				var prefix = helper.getTablePrefixFromPageType(pagetype);

                pool.getConnection(function(err,connection) {
                    if(err || typeof connection === 'undefined') {
						result.msg = 'err';
						response.end(JSON.stringify(result));
                        analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                    } else {
						/* change status, no need to wait for this */
						var qryStatus = "UPDATE " + prefix + "_" + uid + "_0 SET status=1 WHERE xid=" + xid;
						connection.query(qryStatus,function(err,rows,fields) {
							if(err) {
								err.input = qryStatus;
								analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							}
						});

						/* delete any temp rows so only perm rows are delivered */
						var qryTruncate = "DELETE FROM " + prefix + "_" + uid + "_" + xid + " WHERE bt='t'";
						connection.query(qryTruncate,function(err,rows,fields) {
							if(err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								err.input = qryTruncate;
								analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								var qryPageData = "SELECT type,content FROM " + prefix + "_" + uid + "_" + xid;

								connection.query(qryPageData,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										err.input = qryPageData;
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

										result.msg = 'success';
										result.data = pagedata;
										response.end(JSON.stringify(result));
										analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								});
							}
						});
						connection.release();
					}
                });
			}
		});
	}
};
