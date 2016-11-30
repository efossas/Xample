/* eslint-env node, es6 */
/*
	Title: Delete Page
	Route for deleting a page.
*/

var analytics = require('./../analytics.js');

/*
	Function: deletelg

	Ajax, handles the learning guide deletion routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.deletelg = function(request,response) {
	var __function = "deletelg";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
        response.end('nodeleteloggedout');
    } else {
        var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				analytics.journal(true,199,"Overload Attack!",uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
        });

        /* when the request ends,parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                    response.end('err');
                } else {
                    var POST = qs.parse(body);

                    /* change info as needed */
                    var gid = connection.escape(POST.gid).replace(/'/g,'');

                    var qryDeleteRow = "DELETE FROM g_" + uid + " WHERE gid=" + gid;
                    var qryDeletePermGuide = "DROP TABLE g_" + uid + "_" + gid;
                    var qryDeleteTempGuide = "DROP TABLE c_" + uid + "_" + gid;

                    /* three async queries, use this flag for knowning when to send response */
                    var firstQryComplete = false;
                    var secondQryComplete = false;

                    /* delete guide row from user's page list */
                    connection.query(qryDeleteRow,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else if(firstQryComplete) {
                                secondQryComplete = true;
                            } else {
                                firstQryComplete = true;
                            }
                        }
                    });

                    /* delete the permanent page table */
                    connection.query(qryDeletePermGuide,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else if(firstQryComplete) {
                                secondQryComplete = true;
                            } else {
                                firstQryComplete = true;
                            }
                        }
                    });

                    /* delete the temporary page */
                    connection.query(qryDeleteTempGuide,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else if(firstQryComplete) {
                                secondQryComplete = true;
                            } else {
                                firstQryComplete = true;
                            }
                        }
                    });
                    connection.release();
                }
            });
        });
    }
};
