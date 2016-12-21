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

	/* create response object */
	var result = {msg:"",data:{}};

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
		result.msg = 'noprofiledataloggedout';
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

            var POST = qs.parse(body);

			pool.getConnection(function(err,connection) {
                if(err) {
					result.msg = 'err';
                    response.end(JSON.stringify(result));
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
					var qry = "SELECT " + connection.escape(POST.fields).replace(/'/g,"") + " FROM Users WHERE uid=" + uid;

					connection.query(qry,function(err,rows,fields) {
						if(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							result.msg = 'success';
							if(rows[0] === 'undefined') {
								result.data.profiledata = {};
							} else {
								result.data.profiledata = rows[0];
							}
							response.end(JSON.stringify(result));
							analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
						}
					});
					connection.release();
				}
			});
		});
	}
};
