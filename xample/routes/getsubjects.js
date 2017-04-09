/* eslint-env node, es6 */
/*
	Title: Get Subjects
	Route for retrieving subjects from data/topics.json
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: getsubjects

	Ajax, retrieves json with subjects, categories, and topics from json file.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getsubjects = function(request,response) {
	var __function = "getsubjects";

    var userdb = request.app.get("userdb");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	var body = "";
	request.on('data',function(data) {
		body += data;

		/* prevent overload attacks */
		if (body.length > 1e6) {
			request.connection.destroy();
			var errmsg = {message:"Overload Attack!"};
			analytics.journal(true,199,errmsg,uid,global.__stack[1].getLineNumber(),__function,__filename);
		}
	});

	request.on('end',function() {
		var promiseSubjects = queryUserDB.getSubjects(userdb);
		promiseSubjects.then(function(data) {
			result.msg = 'success';
			result.data = data;
			response.end(JSON.stringify(result));
		},function(err) {
			result.msg = 'err';
			response.end(JSON.stringify(result));
			analytics.journal(1,120,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
		});
	});
};
