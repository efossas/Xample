/* eslint-env node, es6 */
/*
	Title: Set Vote On Tag
	Route for getting profile data.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: tagvote

	Sets a vote on a tag for a user.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.tagvote = function(request,response) {
	var __function = "tagvote";

	var qs = require('querystring');

    var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
		result.msg = 'novoteloggedout';
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
			var subject = POST.s;
			var category = POST.c;
			var topic = POST.t;
			var tag = POST.tag;
			var vote = POST.vote;

			var promiseUser = queryUserDB.getDocByUid(userdb,uid);
			promiseUser.then(function(userdata) {
				if(userdata[0].authority < 6) {
					result.msg = 'noauth';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"noauth",uid,global.__stack[1].getLineNumber(),__function,__filename);
					return;
				}

				var promiseVote = queryUserDB.setTagVote(userdb,uid,subject,category,topic,tag,vote);
				promiseVote.then(function(data) {
					result.data.switch = data;
					result.msg = 'success';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
				},function(err) {
					result.msg = 'err';
					response.end(JSON.stringify(err));
					analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				});
			});
		});
	}
};
