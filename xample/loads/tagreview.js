/* eslint-env node, es6 */
/*
	Title: Review Tags
	Loads tag reviews
*/

var analytics = require('./../analytics.js');
var loader = require('./loader.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: tagreview

	Displays the page for reviewing suggested tags.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.tagreview = function(request,response) {
	var __function = "tagreview";

	var userdb = request.app.get("userdb");

	/* get the user's id, getting it from the session ensures user's can edit other users pages */
	var uid = request.session.uid;

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined') {
        loader.loadPage(request,response,"<script>pageLanding(false);</script>");
    } else {

		var body = '';
		request.on('data',function(data) {
			body += data;

			/* prevent overload attacks */
			if (body.length > 1e6) {
				request.connection.destroy();
				var errmsg = {message:"Overload Attack!"};
				analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
			}
		});

		var promiseUser = queryUserDB.getDocByUid(userdb,uid);
		promiseUser.then(function(userdata) {
			if(userdata[0].authority < 6) {
				loader.loadPage(request,response,"<script>pageError('You Do Not Have Authority To View That Page.');</script>");
				analytics.journal(false,0,"noauth",uid,global.__stack[1].getLineNumber(),__function,__filename);
				return;
			}

			var subject = request.query.s;
			var category = request.query.c;
			var topic = request.query.t;
			var tagname = request.query.tag;

			var promiseTagData = queryUserDB.getTagData(userdb,subject,category,topic,tagname);
			promiseTagData.then(function(data) {
				delete data._id;
				var tagdata = data;
				if(typeof data !== 'object') {
					tagdata = {};
				} else {
					/* find this user's existing vote on this tag */
					if(tagdata.upvotes.indexOf(uid) > -1) {
						tagdata.thisUser = "up";
					} else if(tagdata.downvotes.indexOf(uid) > -1) {
						tagdata.thisUser = "down";
					} else {
						tagdata.thisUser = "none";
					}
				}

				var tagdataStr = JSON.stringify(tagdata);

				loader.loadPage(request,response,"<script>pageTagReview('" + tagdataStr + "');</script>");
				analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
			},function(err) {
				loader.loadPage(request,response,"<script>pageTagReview('{}');</script>");
				analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
			});
		});
	}
};
