/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: deletetag

	Ajax, deletes a tag.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.deletetag = function(request,response) {
	var __function = "deletetag";

	var qs = require('querystring');

	var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

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

		var subject = POST.s;
		var category = POST.c;
		var topic = POST.t;
		var tag = POST.dt;

		if(typeof uid === 'undefined') {
			result.msg = 'nosaveloggedout';
			response.end(JSON.stringify(result));
		} else {
			var promiseUser = queryUserDB.getDocByUid(userdb,uid);
			promiseUser.then(function(data) {
				if(data[0].authority < 9) {
					result.msg = 'nosavenoauthority';
					response.end(JSON.stringify(result));
					return;
				}

				var promiseNewTag = queryUserDB.deleteTag(userdb,subject,category,topic,tag,uid);
				promiseNewTag.then(function(data) {
					if(data === "deleted") {
						result.msg = 'success';
						response.end(JSON.stringify(result));
					} else {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						var err = 'queryUserDB.addTag resolve() returned unknown string';
						analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
					}
				},function(err) {
					result.msg = 'err';
					response.end(JSON.stringify(result));
					err.input = 'error creating new tag';
					analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				});
			},function(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				err.input = 'error getting user doc by id';
				analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			});
		}
	});
};
