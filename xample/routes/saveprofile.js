/* eslint-env node, es6 */
/*
	Title: Save Profile
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');

/*
	Function: saveprofile

	Saves profile data to the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.saveprofile = function(request,response) {
	var __function = "saveprofile";

	var qs = require('querystring');
	var ps = require('password-hash');

    var pool = request.app.get("pool");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
		result.msg = 'nosaveloggedout';
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

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
					result.msg = 'err';
					response.end(JSON.stringify(result));
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
					var POST = qs.parse(body);

					/* profile data that requires checks should be queried here and deleted */
					if(Object.prototype.hasOwnProperty.call(POST,'newPass')) {
						var currentPassword = POST.currentPass;
						var newPassword = POST.newPass;

						var qryGetPass = "SELECT password FROM Users WHERE uid=" + uid;

						connection.query(qryGetPass,function(err,rows,fields) {
							if(err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								if(ps.verify(currentPassword,rows[0].password)) {
									var hash = ps.generate(newPassword);
									var qryUpdatePass = "UPDATE Users SET password='" + hash + "' WHERE uid=" + uid;

									connection.query(qryUpdatePass,function(err,rows,fields) {
										if(err) {
											result.msg = 'err';
											response.end(JSON.stringify(result));
											analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									});
								}
							}
						});

						delete POST.currentPass;
						delete POST.newPass;
					}

					var keys = Object.keys(POST);
					var count = keys.length;

					/* count could be less than one, if say, only password was being updated */
					if(count < 1) {
						result.msg = 'profilesaved';
						response.end(JSON.stringify(result));
						analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					} else {
						var qryArray = ["UPDATE Users SET "];

						for(var i = 0; i < count; i++) {
							var current = keys[i];
							qryArray.push(current + "=" + connection.escape(POST[current]) + " ");
						}

						qryArray.push("WHERE uid=" + uid);
						var qry = qryArray.join("");

						connection.query(qry,function(err,rows,fields) {
							if(err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								result.msg = 'profilesaved';
								response.end(JSON.stringify(result));
								analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
							}
						});
					}
					connection.release();
				}
            });
        });
	}
};
