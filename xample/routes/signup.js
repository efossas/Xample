/* eslint-env node, es6 */
/*
	Title: Sign Up
	Route for sign up.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var querydb = require('./../querydb.js');

/*
	Function: signup

	Ajax, handles the sign up routine.

		1 - Get the sign up data
		2 - Check if username exists
		3 - Add user to Users table
		4 - Get user's generated uid
		5 - Create user's page table
		6 - Create user's guide table
		7 - Create user's directory for page media
		8 - Create user's directory for misc thumbnails

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

	/* create response object */
	var result = {msg:"",data:{}};

	var body = '';

    /* when the request gets data, append it to the body string */
    request.on('data',function(data) {
        body += data;

        /* prevent overload attacks */
        if (body.length > 1e6) {
			request.connection.destroy();
			var errmsg = {message: "Overload Attack!"};
			analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
		}
    });

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function() {
        pool.getConnection(function(err,connection) {
            if(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
                analytics.journal(true,221,err,0,global.__stack[1].getLineNumber(),__function,__filename);
            } else {
				var POST = qs.parse(body);

				/* change info as needed */
				var hash = ps.generate(POST.password);

				/* escape these to prevent MySQL injection */
				var username = connection.escape(POST.username);
				var email = connection.escape(POST.email);

				/* check if username already exists */
				var promise = querydb.getUidFromUsername(connection,username);

				promise.then(function(uidsearch) {
					if(uidsearch !== "") {
						result.msg = 'exists';
						response.end(JSON.stringify(result));
					} else {
						var qryUser = "INSERT INTO Users (username,password,email,autosave,defaulttext) VALUES (" + username + ",'" + hash + "'," + email + ",0,1)";

						/* create the user in the Users table */
						connection.query(qryUser,function(err,rows,fields) {
							if (err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								err.input = qryUser;
								analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								/* retrieve the user's new uid */
								var qryUid = "SELECT uid FROM Users WHERE username = " + username;

								connection.query(qryUid,function(err,rows,fields) {
									if (err) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										err.input = qryUid;
										analytics.journal(true,202,err,0,global.__stack[1].getLineNumber(),__function,__filename);
									} else {
										var uid = rows[0].uid;

										var prefixPage = helper.getTablePrefixFromPageType("page");

										/* create the user's page table */
										var qryBlockPageTable = "CREATE TABLE " + prefixPage + "_" + uid + "_0 (xid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, xname VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tags BIGINT UNSIGNED DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, ranks INT UNSIGNED, views INT UNSIGNED, rating SMALLINT UNSIGNED DEFAULT 0, imageurl VARCHAR(128) DEFAULT '', blurb VARCHAR(500))";

										connection.query(qryBlockPageTable,function(err,rows,fields) {
											if (err) {
												result.msg = 'err';
												response.end(JSON.stringify(result));
												err.input = qryBlockPageTable;
												analytics.journal(true,203,err,0,global.__stack[1].getLineNumber(),__function,__filename);
											} else {
												var prefixGuide = helper.getTablePrefixFromPageType("guide");

												/* create the user's guide table */
												var qryLearningGuideTable = "CREATE TABLE " + prefixGuide + "_" + uid + "_0 (xid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, xname VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tags BIGINT UNSIGNED DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, ranks INT UNSIGNED, views INT UNSIGNED, rating SMALLINT UNSIGNED DEFAULT 0, imageurl VARCHAR(128) DEFAULT '', blurb VARCHAR(500))";

												connection.query(qryLearningGuideTable,function(err,rows,fields) {
													if (err) {
														result.msg = 'err';
														response.end(JSON.stringify(result));
														err.input = "qryLearningGuideTable";
														analytics.journal(true,204,err,0,global.__stack[1].getLineNumber(),__function,__filename);
													} else {
														/* make the user's directory to store pages in later */
														request.session.uid = uid;

														var dirPath = request.app.get('fileRoute') + "xm/" + uid;
														fs.mkdir(dirPath,function(err) {
															/* don't consider existing folders as a mkdir error */
															if(err && err.code !== "EEXIST") {
																err.input = dirPath;
																analytics.journal(true,120,err,0,global.__stack[1].getLineNumber(),__function,__filename);
															}

															var thumbPath = dirPath + "/t";
															fs.mkdir(thumbPath,function(err) {
																/* don't consider existing folders as a mkdir error */
																if(err && err.code !== "EEXIST") {
																	err.input = thumbPath;
																	analytics.journal(true,121,err,0,global.__stack[1].getLineNumber(),__function,__filename);
																}
															});
														});

														result.msg = 'success';
														response.end(JSON.stringify(result));
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
					result.msg = 'err';
					response.end(JSON.stringify(result));
					analytics.journal(true,200,error,0,global.__stack[1].getLineNumber(),__function,__filename);
				});
				connection.release();
			}
        });
    });
};
