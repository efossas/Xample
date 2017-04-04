/* eslint-env node, es6 */
/*
	Title: Edit Learning Guide
	Loads learning guide page in edit mode.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var loader = require('./loader.js');
var querypagedb = require('./../querypagedb.js');

/*
	Function: editlg

	Learning guide Edit Mode, used to get a list of learning guide data for a user's page. The data given to the http response is a comma-separate string in this format (links to block pages are ampersand delimited): listnumber,link&link&etc,listnumber,link&link&etc

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.editguide = function(request,response) {
	var __function = "editlg";

    var pool = request.app.get("pool");

	/* get the user's id, getting it from the session ensures user's can edit other users guides */
	var uid = request.session.uid;

	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined') {
        loader.loadPage(request,response,"<script>pageLanding(false);</script>");
    } else {
		/* get table identifier */
		var temp = request.query.temp;

		/* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
		var tid;
		var searchstatus;

		if(temp === "true") {
			tid = helper.getTempTablePrefixFromPageType('guide') + "_";
			searchstatus = false;
		} else if (temp === "false") {
			tid = helper.getTablePrefixFromPageType('guide') + "_";
			searchstatus = false;
		} else {
			tid = helper.getTablePrefixFromPageType('guide') + "_";
			searchstatus = true;
		}

		var prefix = helper.getTablePrefixFromPageType('guide');

        pool.getConnection(function(err,connection) {
            if(err || typeof connection === 'undefined') {
				loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
                analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
            } else {
				/* get the gid from the get request */
				var gid = connection.escape(request.query.guide).replace(/'/g,"");

				if(typeof gid === 'undefined') {
					loader.loadLearningGuidePage(request,response,"<script>pageError('badquery');</script>");
				} else {
					var promise = querypagedb.getStatusFromXid(connection,prefix,uid,gid);

					promise.then(function(success) {
						if(searchstatus && success === 0) {
							/* load the edit page with the page data */
							loader.loadLearningGuidePage(request,response,"<script>pageChoose('" + gid + "');</script>");
						} else {
							var promiseSettings = querypagedb.getPageSettings(connection,prefix,uid,gid);

							promiseSettings.then(function(guideSettings) {
								if(guideSettings.err === 'notfound') {
									loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
									analytics.journal(true,201,{message:'getPageSettings()'},uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									guideSettings['id'] = guideSettings['xid'];
									delete guideSettings['xid'];
									guideSettings['name'] = guideSettings['xname'];
									delete guideSettings['xname'];

									var guideinfo = JSON.stringify(guideSettings);

									var qry = "SELECT type,content FROM " + tid + uid + "_" + gid;

									connection.query(qry,function(err,rows,fields) {
										if(err) {
											loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
											err.input = qry;
											analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										} else {
											var guidedata = "";

											/* i is for accessing row array, j is for keeping track of rows left to parse */
											var i = 0;
											var j = rows.length;

											/* append commas to each row except for the last one */
											while(j > 1) {
												guidedata += rows[i].type + "," + rows[i].content + ",";
												i++;
												j--;
											}
											if(j === 1) {
												guidedata += rows[i].type + "," + rows[i].content;
											}

											/* load the edit page with the page data */
											loader.loadLearningGuidePage(request,response,"<script>pageEditLG('" + uid + "','" + guidedata + "'," + guideinfo + ");</script>");
											analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									});
								}
							},function(err) {
								loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
								analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							});
							connection.release();
						}
					},function(error) {
						loader.loadLearningGuidePage(request,response,"<script>pageError('dberr');</script>");
						analytics.journal(true,200,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
					});
				}
			}
        });
	}
};
