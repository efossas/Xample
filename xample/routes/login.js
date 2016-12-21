/* eslint-env node, es6 */
/*
	Title: Log In
	Route for logging in.
*/

var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');

/*
	Function: login

	Ajax, handles the log in routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.login = function(request,response) {
	var __function = "login";

	var qs = require('querystring');
	var ps = require('password-hash');

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
			var errmsg = {message:"Overload Attack!"};
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
				var username = connection.escape(POST.username);

				/* check if username already exists */
				var promise = querydb.getUidFromUsername(connection,username);

				promise.then(function(success) {
					if(success === "") {
						result.msg = 'notfound';
						response.end(JSON.stringify(result));
					} else {
						var uid = success;

						var qry = "SELECT password FROM Users WHERE uid = '" + uid + "'";

						/* retrieve the user's password */
						connection.query(qry,function(err,rows,fields) {
							if (err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								/* check that the entered password matches the stored password */
								if(ps.verify(POST.password,rows[0].password)) {
									/* set the user's session, this indicates logged in status */
									request.session.uid = uid;

									/* respond */
									result.msg = 'loggedin';
									response.end(JSON.stringify(result));
									analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									result.msg = 'incorrect';
									response.end(JSON.stringify(result));
								}
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
