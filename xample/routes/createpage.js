/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: createpage

	Ajax, handles the page creation routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.createpage = function(request,response) {
	var __function = "createpage";

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
                analytics.journal(true,199,"Overload Attack!",0,analytics.__line,__function,__filename);
            }
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
                }

                var POST = qs.parse(body);

                /* escape the page name to prevent Sql injection */
                var pagename = connection.escape(POST.pagename);
                var subject = connection.escape(POST.subject);
                var category = connection.escape(POST.category);
                var topic = connection.escape(POST.topic);

                /* check if page name exists */
                var promise = querydb.searchPagename(connection,uid,pagename);

                promise.then(function(success) {

                    if(success !== -1) {
                        response.end('pageexists');
                    } else {
                        /* insert page into user's page table */
                        var qryUser = "INSERT INTO u_" + uid + " (pagename,status,subject,category,topic) VALUES (" + pagename + ",1," + subject + "," + category + "," + topic + ")";

                        connection.query(qryUser,function(err,rows,fields) {
                            if (err) {
                                response.end('err');
                                analytics.journal(true,201,err,uid,analytics.__line,__function,__filename);
                            } else {
                                /* grab the pid of the new page name from the user's page table */
                                var promisePid = querydb.searchPid(connection,uid,pagename);

                                promisePid.then(function(success) {
                                    if(success === -1) {
                                        response.end('err');
                                        analytics.journal(true,203,"pid not found after page insert",uid,analytics.__line,__function,__filename);
                                    } else {
                                        var pid = success;

                                        /* create the page's permanent table */
                                        var qryPage = "CREATE TABLE p_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";

                                        connection.query(qryPage,function(err,rows,fields) {
											if (err) {
												response.end('err');
												analytics.journal(true,204,err,uid,analytics.__line,__function,__filename);
											}
										});

										/* create the page's temporary table */
										var qryTemp = "CREATE TABLE t_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";

										connection.query(qryTemp,function(err,rows,fields) {
											if (err) {
												response.end('err');
												analytics.journal(true,205,err,uid,analytics.__line,__function,__filename);
											}
										});

										/* make a folder in user's media folder to store future media uploads */
										fs.mkdir(request.app.get('fileRoute') + "xm/" + uid + "/" + pid,function(err) {
											/* don't consider existing folders as a mkdir error */
											if(err && err.code !== "EEXIST") {
												analytics.journal(true,120,err,uid,analytics.__line,__function,__filename);
											}
										});
										response.end(pid.toString());
										analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
									}
								},function(error) {
									response.end('err');
									analytics.journal(true,202,error,uid,analytics.__line,__function,__filename);
								});
							}
						});
					}
				},function(error) {
					response.end('err');
					analytics.journal(true,200,error,0,analytics.__line,__function,__filename);
				});
                connection.release();
            });
		});
	}
};
