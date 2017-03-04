/* eslint-env node, es6 */
/*
	Title: Get Subjects
	Route for retrieving subjects from data/topics.json
*/

var analytics = require('./../analytics.js');

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

    var fs = require("fs");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

    /* get the topics from the local json file */
    fs.readFile('data/topics.json',function(err,data) {
        if (err) {
			result.msg = 'err';
            response.end(JSON.stringify(result));
            analytics.journal(1,120,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
        } else {
			result.msg = 'success';
			result.data = JSON.parse(data.toString());
            response.end(JSON.stringify(result));
        }
    });
};
