/* eslint-env node, es6 */
/*
	Title: Profile
	Loads profile page.
*/

var analytics = require('./../analytics.js');
var loader = require('./loader.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: profile

	Grabs profile information and returns it to the front-end to display the profile page.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.profile = function(request,response) {
	var __function = "profile";

    var userdb = request.app.get("userdb");

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
        loader.loadPage(request,response,"<script>pageError('noprofileloggedout');</script>");
    } else {
		var promiseUser = queryUserDB.getDocByUid(userdb,uid);
		promiseUser.then(function(userdata) {
			var data = {};

			data["username"] = userdata[0].username;
			data["email"] = typeof userdata[0].email === 'undefined' ? '' : userdata[0].email;
			data["phone"] = typeof userdata[0].phone === 'undefined' ? '' : userdata[0].phone;
			data["autosave"] = userdata[0].autosave;
            data["defaulttext"] = userdata[0].defaulttext;

			var profiledata = JSON.stringify(data);

			loader.loadPage(request,response,"<script>pageProfile('" + profiledata + "');</script>");
			analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
		},function(err) {
			loader.loadPage(request,response,"<script>pageError('dberr');</script>");
			analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
		});
	}
};
