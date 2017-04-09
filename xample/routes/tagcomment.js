/* eslint-env node, es6 */
/*
	Title: Add Comment To Tag
	Route for getting profile data.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: tagcomment

	Adds a comment to a tag.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.tagcomment = function(request,response) {
	var __function = "tagcomment";

	var qs = require('querystring');

    var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
		result.msg = 'nocommentloggedout';
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
			var comment = POST.comment;

			/* validate data */
			if(typeof comment !== 'string' || comment.length > 1023) {
				result.msg = 'baddata';
				response.end(JSON.stringify(result));
				return;
			}

			/* grab possible thread and comment */
			var newComment = {};

			var thread = comment.match(/^@\w+/);
			if(thread !== null) {
				comment = comment.replace(/^@\w+ /,"");
				newComment.thread = thread[0];
			} else {
				newComment.thread = "";
			}

			newComment.comment = comment;

			var promiseUser = queryUserDB.getDocByUid(userdb,uid);
			promiseUser.then(function(userdata) {
				if(userdata[0].authority < 6) {
					result.msg = 'noauth';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"noauth",uid,global.__stack[1].getLineNumber(),__function,__filename);
					return;
				}

				/* add comment's username, id, timestamp, boost (upvotes for good point) */
				newComment.writerId = uid;
				newComment.writerName = userdata[0].username;
				newComment.timeStamp = Date.now();
				newComment.boost = 0;

				var promiseComment = queryUserDB.setTagComment(userdb,subject,category,topic,tag,newComment);
				promiseComment.then(function(data) {
					// data being returned is whether anything was modified (1 yes, 0 no)
					if(data > 0) {
						result.data.comment = newComment;
						result.msg = 'success';
					} else {
						result.msg = 'refresh';
						result.data.comment = {};
					}
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
