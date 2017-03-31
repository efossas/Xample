/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var queryPageDB = require('./../querypagedb.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: listdata

	Ajax, handles getting list of content data.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.getbmdata = function(request,response) {
	var __function = "getbmdata";

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
		/* when the request gets data, append it to the body string */
		var body = '';
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

			var pagetype = POST.pagetype;

			var bmType;
			switch(pagetype) {
				case 'guide':
					bmType = 'guide'; break;
				case 'page':
					bmType = 'page'; break;
				default:
					result.msg = 'err';
					response.end(JSON.stringify(result));
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

				pool.getConnection(function(err,connection) {
					if(err) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						return;
					}

					var prefix = helper.getTablePrefixFromPageType(pagetype);

					var bmKeys = Object.keys(bookmarks[bmType]);

					var bmLength = bmKeys.length;
					if(bmLength > 0 && bmKeys) {
						var qry = "SELECT * FROM ( ";

						var qryBM = "";
						for(var i = 0; i < bmKeys.length; i++) {
							var pidArray = bookmarks[bmType][bmKeys[i]];
							pidArray.forEach(function(elem) {
								qryBM += "(SELECT '" + bmKeys[i] + "' AS 'aid',xid,xname,username AS 'author',imageurl FROM " + prefix + "_" + bmKeys[i] + "_0 WHERE xid='" + elem + "') UNION ";
							});
						}

						/* make sure bookmarks to query were actually grabbed */
						if(qryBM !== "") {
							qry += qryBM;
						} else {
							result.msg = 'success';
							result.data.bmdata = [];
							response.end(JSON.stringify(result));
						}

						qry = qry.slice(0,-7) + " ) a ORDER BY xname ASC";

						connection.query(qry,function(err,rows,fields) {
							if(err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								err.input = qry;
								analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								return;
							}

							result.msg = 'success';
							result.data.bmdata = rows;
							response.end(JSON.stringify(result));
						});
					} else {
						result.msg = 'success';
						result.data.bmdata = {};
						response.end(JSON.stringify(result));
					}
				});
			},function(err) {
				result.msg = 'err';
				response.end(JSON.stringify(result));
				analytics.journal(true,202,err,0,global.__stack[1].getLineNumber(),__function,__filename);
			});
		});
	}
};
