/* eslint-env node, es6 */
/*
	Title: Delete Page
	Route for deleting a page.
*/

var analytics = require('./../analytics.js');

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
				analytics.journal(true,199,"Overload Attack!",uid,analytics.__line,__function,__filename);
			}
        });

        /* when the request ends,parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
                    response.end('err');
                } else {
                    var POST = qs.parse(body);

                    /* change info as needed */
                    var pid = connection.escape(POST.pid).replace(/'/g,'');

                    var qryDeleteRow = "DELETE FROM u_" + uid + " WHERE pid=" + pid;
                    var qryDeletePermPage = "DROP TABLE p_" + uid + "_" + pid;
                    var qryDeleteTempPage = "DROP TABLE t_" + uid + "_" + pid;

                    /* three async queries, use this flag for knowning when to send response */
                    var firstQryComplete = false;
                    var secondQryComplete = false;

                    /* delete page row from user's page list */
                    connection.query(qryDeleteRow,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
                            } else if(firstQryComplete) {
                                secondQryComplete = true;
                            } else {
                                firstQryComplete = true;
                            }
                        }
                    });

                    /* delete the permanent page table */
                    connection.query(qryDeletePermPage,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
                            } else if(firstQryComplete) {
                                secondQryComplete = true;
                            } else {
                                firstQryComplete = true;
                            }
                        }
                    });

                    /* delete the temporary page */
                    connection.query(qryDeleteTempPage,function(err,rows,fields) {
                        if(err) {
                            response.end('err');
                            analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
                        } else {
                            if(firstQryComplete && secondQryComplete) {
                                response.end("success");
                                analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
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
