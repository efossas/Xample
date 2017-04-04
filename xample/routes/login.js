/* eslint-env node, es6 */
/*
	Title: Log In
	Route for logging in.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

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
	var scrypt = require("scrypt");

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
			var errmsg = {message:"Overload Attack!"};
			analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
		}
    });

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function() {

		var POST = qs.parse(body);

		/* change info as needed */
		var username = POST.username;

		var promiseGetUser = queryUserDB.getDocByUsername(userdb,username);
		promiseGetUser.then(function(userdata) {
			/* check that the entered password matches the stored password */
			if(scrypt.verifyKdfSync(userdata[0].password.buffer,POST.password)) {
				/* set the user's session, this indicates logged in status */
				request.session.uid = userdata[0]._id;
				request.session.auth = userdata[0].authority;

				/* delete possible unneeded cookies */
				response.clearCookie("id");

				result.msg = 'loggedin';
				response.end(JSON.stringify(result));
				analytics.journal(false,0,"",userdata[0]._id,analytics.__line,__function,__filename);
			} else {
				result.msg = 'incorrect';
				response.end(JSON.stringify(result));
			}
		},function(error) {
			/// handle error
		});
	});
};
