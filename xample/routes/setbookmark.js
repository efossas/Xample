/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: setbookmark

	Ajax, handles creating and deleting user bookmarks.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.setbookmark = function(request,response) {
	var __function = "setbookmark";

	var qs = require('querystring');

    var pool = request.app.get("pool");
	var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
		result.msg = 'nocreateloggedout';
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
                analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
            }
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
			var POST = qs.parse(body);

			var aid = POST.aid;
			var pid = Number(POST.pid);
			var bmType;
			switch(POST.pagetype) {
				case 'guide':
					bmType = 'guide'; break;
				case 'page':
					bmType = 'page'; break;
				default:
					result.msg = 'err';
					response.end(JSON.stringify(result));
			}

			/* validate the data a bit */
			if(aid.length > 24 || pid.length > 5) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				return;
			}

			var promiseUser = queryUserDB.getDocByUid(userdb,uid);
			promiseUser.then(function(res) {
				var bookmarks = res[0].bookmarks;

				/* create bookmarks map if it doesn't exist */
				if(typeof bookmarks === 'undefined') {
					bookmarks = {guide:{},page:{}};
				} else if(!bookmarks.hasOwnProperty(bmType)) {
					bookmarks[bmType] = {};
				}

				/* add or delete bookmark */
				if(POST.action === 'create') {
					if(bookmarks[bmType].hasOwnProperty(aid)) {
						/* only add it's not in there yet */
						if(bookmarks[bmType][aid].indexOf(pid) < 0) {
							bookmarks[bmType][aid].push(pid);
						}
					} else {
						bookmarks[bmType][aid] = [pid];
					}
				} else if(POST.action === 'delete') {
					var index = bookmarks[bmType][aid].indexOf(pid);
					if (index > -1) {
						bookmarks[bmType][aid].splice(index,1);
					}
				}

				var promiseUpdate = queryUserDB.updateUser(userdb,uid,{bookmarks:bookmarks});
				promiseUpdate.then(function(res) {
					response.cookie('bm',bookmarks);
					result.msg = 'success';
					response.end(JSON.stringify(result));
				},function(err) {
					result.msg = 'err';
					response.end(JSON.stringify(result));
					analytics.journal(true,201,err,0,global.__stack[1].getLineNumber(),__function,__filename);
				});
			},function(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				analytics.journal(true,202,err,0,global.__stack[1].getLineNumber(),__function,__filename);
			});
		});
	}
};
