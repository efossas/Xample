/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: createlg

	Ajax, handles the learning guide creation routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.createlg = function(request,response) {
	var __function = "createlgs";

	var qs = require('querystring');
	var fs = require('fs');

    var pool = request.app.get("pool");

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
        response.end('nocreateloggedout');
    } else {
		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
                request.connection.destroy();
                analytics.journal(true,199,"Overload Attack!",0,global.__stack[1].getLineNumber(),__function,__filename);
            }
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                }

                var POST = qs.parse(body);

                /* escape the page name to prevent Sql injection */
                var guidename = connection.escape(POST.guidename);

                /* check if page name exists */
                var promise = querydb.searchGuidename(connection,uid,guidename);

                promise.then(function(success) {
                    if(success !== -1) {
                        response.end('guideexists');
                    } else {
                        /* insert page into user's page table */

                        var qryUser = "INSERT INTO g_" + uid + " (guidename,status,tags,created,edited,ranks,views,rating) VALUES (" + guidename + ",1,0,NOW(),NOW(),0,0,0)";
                        connection.query(qryUser,function(err,rows,fields) {
                            if (err) {
                                response.end('err');
                                analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                            } else {
                                /* grab the gid of the new guide name from the user's guide table */
                                var promiseGid = querydb.searchGid(connection,uid,guidename);

                                promiseGid.then(function(success) {
                                    if(success === -1) {
                                        response.end('err');
                                        analytics.journal(true,203,"gid not found after page insert",uid,global.__stack[1].getLineNumber(),__function,__filename);
                                    } else {
                                        var gid = success;

                                        /* create the page's permanent table */
                                        var qryGuide = "CREATE TABLE g_" + uid + "_" + gid + " (bid TINYINT UNSIGNED, type CHAR(5), content VARCHAR(4096) )";

                                        connection.query(qryGuide,function(err,rows,fields) {
											if (err) {
												response.end('err');
												analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
											}
										});

										/* create the guide's temporary table */
										var qryTemp = "CREATE TABLE c_" + uid + "_" + gid + " (bid TINYINT UNSIGNED, type CHAR(5), content VARCHAR(4096) )";

										connection.query(qryTemp,function(err,rows,fields) {
											if (err) {
												response.end('err');
												analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
											}
										});

										response.end(gid.toString());
										analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								},function(error) {
									response.end('err');
									analytics.journal(true,202,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
								});
							}
						});
					}
				},function(error) {
					response.end('err');
					analytics.journal(true,200,error,0,global.__stack[1].getLineNumber(),__function,__filename);
				});
                connection.release();
            });
		});
	}
};
