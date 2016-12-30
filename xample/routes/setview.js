/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');

/*
	Function: setview

	Ajax, validates and increments views.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.setview = function(request,response) {
	var __function = "setbookmark";

	var qs = require('querystring');

	var cachedb = request.app.get("cachedb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;
	if(!uid) {
		uid = 0;
	}

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

		var aid = POST.aid;
		var xid = POST.xid;

		/* validate the data a bit */
		if(aid.length > 24 || xid.length > 5) {
			result.msg = 'err';
			response.end(JSON.stringify(result));
			return;
		}

		helper.determineView(request,response,'page',cachedb,uid,aid,xid);

		result.msg = 'success';
		response.end(JSON.stringify(result));
	});
};
