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
            var username = connection.escape(POST.username);

            /* check if username already exists */
            var promise = querydb.searchUid(connection,username);

            promise.then(function(success) {

                if(success === -1) {
                    response.end('notfound');
                } else {
                    var uid = success;

                    var qry = "SELECT password FROM Users WHERE uid = '" + uid + "'";

                    /* retrieve the user's password */
                    connection.query(qry,function(err,rows,fields) {
						if (err) {
							response.end('err');
							analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							/* check that the entered password matches the stored password */
							if(ps.verify(POST.password,rows[0].password)) {
								/* set the user's session, this indicates logged in status */
								request.session.uid = uid;
								response.end('loggedin');
								analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								response.end('incorrect');
							}
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
