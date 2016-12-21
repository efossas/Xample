/* eslint-env node, es6 */
/*
	Title: Profile
	Loads profile page.
*/

var loader = require('./loader.js');
var analytics = require('./../analytics.js');

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

    var pool = request.app.get("pool");

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
        loader.loadPage(request,response,"<script>pageError('noprofileloggedout');</script>");
    } else {

		var qry = "SELECT username,email,phone,autosave,defaulttext FROM Users WHERE uid=" + uid;

		pool.getConnection(function(err,connection) {
            if(err) {
                analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
            }

			connection.query(qry,function(err,rows,fields) {
				if(err) {
					loader.loadPage(request,response,"<script>pageError('dberr');</script>");
					analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				} else {
					var data = {};

					data["username"] = rows[0].username;
					data["email"] = rows[0].email;
					data["phone"] = rows[0].phone;
					data["autosave"] = rows[0].autosave;
                    data["defaulttext"] = rows[0].defaulttext;

					var profiledata = JSON.stringify(data);

					loader.loadPage(request,response,"<script>pageProfile('" + profiledata + "');</script>");
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
				}
			});
            connection.release();
		});
	}
};
