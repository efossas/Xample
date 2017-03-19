/* eslint-env node, es6 */
/*
	Title: Save Profile
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: saveprofile

	Saves profile data to the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.saveprofile = function(request,response) {
	var __function = "saveprofile";

	var qs = require('querystring');
	var ps = require('password-hash');

    var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
		result.msg = 'nosaveloggedout';
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
			var promiseUser = queryUserDB.getDocByUid(userdb,uid);
			promiseUser.then(function(res) {
				/* get the user doc */
				var doc = res[0];

				var POST = qs.parse(body);

				/* remove any fields that users should not be allowed to edit */
				delete POST.authority;

				/* profile data that requires checks should be queried here and deleted */
				if(Object.prototype.hasOwnProperty.call(POST,'newPass')) {
					var currentPassword = POST.currentPass;
					var newPassword = POST.newPass;

					if(ps.verify(currentPassword,doc.password)) {
						var hash = ps.generate(newPassword);

						var passObj = {password:hash};

						var promisePass = queryUserDB.updateUser(userdb,uid,passObj);
						promisePass.then(function(res) {
							// nothing to do here
						},function(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = 'error changing user password';
							analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						});

					} else {
						result.msg = 'nomatch';
						response.end(JSON.stringify(result));
					}
					delete POST.currentPass;
					delete POST.newPass;
				}

				var keys = Object.keys(POST);
				var count = keys.length;

				/* count could be less than one, if say, only password was being updated */
				if(count < 1) {
					result.msg = 'profilesaved';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
				} else {
					var propObj = {};

					for(var i = 0; i < count; i++) {
						var current = keys[i];
						propObj[current] = POST[current];
					}

					var promiseUpdate = queryUserDB.updateUser(userdb,uid,propObj);
					promiseUpdate.then(function(res) {
						result.msg = 'profilesaved';
						response.end(JSON.stringify(result));
						analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					},function(err) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
					});
				}
			},function(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			});
        });
	}
};
