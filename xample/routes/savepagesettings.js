/* eslint-env node, es6 */
/*
	Title: Save Page Settings
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');

/*
	Function: savepagesettings

	Saves page data settings to the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.savepagesettings = function(request,response) {
	var __function = "savepagesettings";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
        response.end('nosaveloggedout');
    } else {

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				analytics.journal(true,199,"Overload Attack!",uid,analytics.__line,__function,__filename);
			}
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
                }

                var POST = qs.parse(body);

				// var pid = connection.escape(POST.pid);
				//
                // var qryArray = ["UPDATE p_" + pid + " SET "];
				// qryArray.push("pagename=" + connection.escape(POST.p)); // pagename
				// connection.escape(POST.s); // subject
				// connection.escape(POST.c); // category
				// connection.escape(POST.t); // topic
				// connection.escape(POST.g); // tags
                // var qry = qryArray.join("");
				//
                // connection.query(qry,function(err,rows,fields) {
				// 	if(err) {
				// 		response.end('err');
				// 		analytics.journal(true,203,err,uid,analytics.__line,__function,__filename);
				// 	} else {
				// 		response.end('profilesaved');
				// 		analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
				// 	}
                // });

				response.end('profilesaved');

                connection.release();
            });
        });
	}
};
