/* eslint-env node, es6 */
/*
	Title:Journal Error
	Route for logging frontend errors to the database.
*/

var analytics = require('./../analytics.js');

/*
	Function: journalerror

	Ajax, handles the log in routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.journalerror = function(request,response) {
	var __function = "journalerror";

	var qs = require('querystring');

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

	/* get the user's id */
	var uid;
	if(request.session.uid) {
		uid = request.session.uid;
	} else {
		uid = 0;
	}

	var pool = request.app.get("pool");

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function() {
		/* this connection is purely for using the escape() function, could be eliminated */
		pool.getConnection(function(err,connection) {
			if(err) {
				analytics.journal(true,220,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
			var POST = qs.parse(body);

			/* change info as needed */
			var message = connection.escape(POST.message);
			var linenum = connection.escape(POST.linenum);
			var script = connection.escape(POST.urlsource);

			response.end("");

			/* journal the frontend error, don't have function where error occurred though */
			analytics.journal(true,150,message,uid,linenum,'',script);
		});
	});
};
