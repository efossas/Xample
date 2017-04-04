/* eslint-env node, es6 */
/*
	Title: Delete Page
	Route for deleting a page.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');

/*
	Function: deletepage

	Ajax, handles the page deletion routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.deletepage = function(request,response) {
	var __function = "deletepage";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
		result.msg = 'nodeleteloggedout';
        response.end(JSON.stringify(result));
    } else {
        var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				var err = {message:"Overload Attack!"};
				analytics.journal(true,199,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
        });

        /* when the request ends,parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err || typeof connection === 'undefined') {
					result.msg = 'err';
                    response.end(JSON.stringify(result));
					analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
                    var POST = qs.parse(body);

                    /* change info as needed */
                    var xid = connection.escape(POST.xid).replace(/'/g,'');
					var pagetype = connection.escape(POST.pt).replace(/'/g,'');

					var prefix = helper.getTablePrefixFromPageType(pagetype);

                    var qryDeleteRow = "DELETE FROM " + prefix + "_" + uid + "_0 WHERE xid=" + xid;
                    var qryDeletePermPage = "DROP TABLE " + prefix + "_" + uid + "_" + xid;

                    /* two async queries, use this flag for knowning when to send response */
                    var otherQryComplete = false;

                    /* delete page row from user's page list */
                    connection.query(qryDeleteRow,function(err,rows,fields) {
                        if(err) {
							result.msg = 'err';
                            response.end(JSON.stringify(result));
							err.input = qryDeleteRow;
                            analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                        } else {
                            if(otherQryComplete) {
								result.msg = 'success';
                                response.end(JSON.stringify(result));
                                analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else {
                                otherQryComplete = true;
                            }
                        }
                    });

                    /* delete the page table */
                    connection.query(qryDeletePermPage,function(err,rows,fields) {
                        if(err) {
							result.msg = 'err';
                            response.end(JSON.stringify(result));
							err.input = qryDeletePermPage;
                            analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                        } else {
                            if(otherQryComplete) {
								result.msg = 'success';
                                response.end(JSON.stringify(result));
                                analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else {
                                otherQryComplete = true;
                            }
                        }
                    });
                    connection.release();
                }
            });
        });
    }
};
