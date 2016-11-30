/* eslint-env node, es6 */
/*
	Title: Sign Up
	Route for sign up.
*/

var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: signup

	Ajax, handles the sign up routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.signup = function(request,response) {
	var __function = "signup";

	var qs = require('querystring');
	var ps = require('password-hash');
	var fs = require('fs');

    var pool = request.app.get("pool");

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
                analytics.journal(true,221,err,0,global.__stack[1].getLineNumber(),__function,__filename);
            }

            var POST = qs.parse(body);

            /* change info as needed */
            var hash = ps.generate(POST.password);

            /* get only numbers from the phone number */
            var phone = POST.phone;
            phone = phone.replace(/\D/g,'');

            /* escape these to prevent MySQL injection */
            var username = connection.escape(POST.username);
            var email = connection.escape(POST.email);

            /* check if username already exists */
            var promise = querydb.searchUid(connection,username);

            promise.then(function(success) {

                    if(success !== -1) {
                        response.end('exists');
                    } else {
                            var qryUser = "INSERT INTO Users (username,password,email,phone,autosave,defaulttext) VALUES (" + username + ",'" + hash + "'," + email + ",'" + phone + "',0,1)";

					/* create the user in the Users table */
					connection.query(qryUser,function(err,rows,fields) {

						if (err) {
							response.end('err');
							analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
                            var qryUid = "SELECT uid FROM Users WHERE username = " + username;

                            /* retrieve the user's new uid */
                            connection.query(qryUid,function(err,rows,fields) {
								if (err) {
									response.end('err');
									analytics.journal(true,202,err,0,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									var uid = rows[0].uid;

									var qryBlockPageTable = "CREATE TABLE p_" + uid + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tags BIGINT UNSIGNED, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, ranks INT UNSIGNED, views INT UNSIGNED, rating SMALLINT UNSIGNED DEFAULT 0, imageurl VARCHAR(128), blurb VARCHAR(500))";

									/* create the user's page table */
									connection.query(qryBlockPageTable,function(err,rows,fields) {
										if (err) {
											response.end('err');
											analytics.journal(true,203,err,0,global.__stack[1].getLineNumber(),__function,__filename);
										} else {
											var qryLearningGuideTable = "CREATE TABLE g_" + uid + " (gid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, guidename VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tags BIGINT UNSIGNED, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, ranks INT UNSIGNED, views INT UNSIGNED, imageurl VARCHAR(128), blurb VARCHAR(500))";

											/* create the user's page table */
											connection.query(qryLearningGuideTable,function(err,rows,fields) {
												if (err) {
													response.end('err');
													analytics.journal(true,204,err,0,global.__stack[1].getLineNumber(),__function,__filename);
												} else {
													/* make the user's directory to store pages in later */
													request.session.uid = uid;
													fs.mkdir(request.app.get('fileRoute') + "xm/" + uid,function(err) {
														/* don't consider existing folders as a mkdir error */
														if(err && err.code !== "EEXIST") {
															analytics.journal(true,120,err,0,global.__stack[1].getLineNumber(),__function,__filename);
														}
													});
													response.end('success');
													analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
												}
											});
										}
									});
								}
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
};
