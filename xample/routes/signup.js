/* eslint-env node, es6 */
/*
	Title: Sign Up
	Route for sign up.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var queryUserDB = require('./../queryuserdb.js');

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
	var scrypt = require("scrypt");
	var scryptParameters = scrypt.paramsSync(0.1);
	var fs = require('fs');

    var pool = request.app.get("pool");
	var userdb = request.app.get("userdb");

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

    /* when the request ends, parse the POST data, & process the queries */
    request.on('end',function() {
		var POST = qs.parse(body);

        /* get the data */
		var kdfResult = scrypt.kdfSync(POST.password,scryptParameters);
        var username = POST.username;
        var email = POST.email;

		/* ensure username is not taken */
		var promiseCheckUsername = queryUserDB.getDocByUsername(userdb,username);
		promiseCheckUsername.then(function(users) {
			if(users.length > 0) {
				result.msg = 'exists';
                response.end(JSON.stringify(result));
				return;
			}

			/* add the user to db */
			var promiseCreateUser = queryUserDB.createUser(userdb,username,kdfResult,email);
			promiseCreateUser.then(function(res) {
				if(res === 'closed') {
					result.msg = 'closed';
					response.setHeader('content-type','application/json');
					response.end(JSON.stringify(result));
					return;
				}

				/* log the user in */
				var uid = res.ops[0]._id;
				request.session.uid = uid;

				pool.getConnection(function(err,connection) {
					if(err || typeof connection === 'undefined') {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						analytics.journal(true,221,err,0,global.__stack[1].getLineNumber(),__function,__filename);
						return;
					}

					var prefixPage = helper.getTablePrefixFromPageType("page");

					/* create the user's page table */
					var qryBlockPageTable = "CREATE TABLE " + prefixPage + "_" + uid + "_0 (xid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, xname VARCHAR(50), username VARCHAR(40), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tagone VARCHAR(32), tagtwo VARCHAR(32), tagthree VARCHAR(32), btypes INT UNSIGNED DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, rankpoints INT UNSIGNED, ranks INT UNSIGNED, views INT UNSIGNED, rating SMALLINT UNSIGNED DEFAULT 0, imageurl VARCHAR(128) DEFAULT '', blurb VARCHAR(500), FULLTEXT(tagone,tagtwo,tagthree,blurb))";

					connection.query(qryBlockPageTable,function(err,rows,fields) {
						if (err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = qryBlockPageTable;
							analytics.journal(true,203,err,0,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							var prefixGuide = helper.getTablePrefixFromPageType("guide");

							/* create the user's guide table */
							var qryLearningGuideTable = "CREATE TABLE " + prefixGuide + "_" + uid + "_0 (xid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, xname VARCHAR(50), username VARCHAR(40), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32), tagone VARCHAR(32), tagtwo VARCHAR(32), tagthree VARCHAR(32), btypes INT UNSIGNED DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, edited TIMESTAMP, rankpoints INT UNSIGNED, ranks INT UNSIGNED, views INT UNSIGNED, rating SMALLINT UNSIGNED DEFAULT 0, imageurl VARCHAR(128) DEFAULT '', blurb VARCHAR(500), FULLTEXT(tagone,tagtwo,tagthree,blurb))";

							connection.query(qryLearningGuideTable,function(err,rows,fields) {
								if (err) {
									result.msg = 'err';
									response.end(JSON.stringify(result));
									err.input = qryLearningGuideTable;
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

					result.msg = 'success';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
				});
			},function(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				analytics.journal(true,202,err,0,global.__stack[1].getLineNumber(),__function,__filename);
			});
		},function(err) {
			result.msg = 'err';
			response.end(JSON.stringify(result));
			analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
		});
    });
};
