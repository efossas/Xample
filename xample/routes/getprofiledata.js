/* eslint-env node, es6 */
/*
	Title: Get Profile Data
	Route for getting profile data.
*/

var analytics = require('./../analytics.js');

/*
	Function: getprofiledata

	Grabs profile information and returns it.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getprofiledata = function(request,response) {
	var __function = "getprofiledata";

	var qs = require('querystring');

    var pool = request.app.get("pool");

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
        response.end('noprofiledataloggedout');
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

            var POST = qs.parse(body);

			var qry = "SELECT " + POST.fields + " FROM Users WHERE uid=" + uid;

			pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,analytics.__line,__function,__filename);
                }

				connection.query(qry,function(err,rows,fields) {
					if(err) {
						response.end('err');
						analytics.journal(true,200,err,uid,analytics.__line,__function,__filename);
					} else {
						var profiledata = JSON.stringify(rows[0]);

						response.end(profiledata);
						analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
					}
				});
                connection.release();
			});
		});
	}
};
