/* eslint-env node, es6 */
/*
	Title: Save Page Settings
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var queryPageDB = require('./../querypagedb.js');
var queryUserDB = require('./../queryuserdb.js');

/*
	Function: savepagesettings

	Saves page data settings to the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.savepagesettings = function(request,response) {
	var __function = "savepagesettings";

	var qs = require('querystring');

    var pool = request.app.get("pool");
	var red = request.app.get("red");
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
				return;
			}
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
					result.msg = 'err';
                    response.end(JSON.stringify(result));
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
					return;
                }

				var POST = qs.parse(body);
				var pagetype = connection.escape(POST.pt).replace(/'/g,"");
				var pid = connection.escape(POST.id).replace(/'/g,"");
				var pagetitle = connection.escape(POST.p);
				var subject = connection.escape(POST.s);
				var category = connection.escape(POST.c);
				var topic = connection.escape(POST.t);
				var imageurl = connection.escape(POST.i);
				var blurb = connection.escape(POST.b);

				var prefix = helper.getTablePrefixFromPageType(pagetype);

				if(subject.replace(/[']/g,"") === "") {
					result.msg = 'nosubjectnotsaved';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					return;
				} else if (!pagetype) {
					result.msg = 'invalidpagetype';
					response.end(JSON.stringify(result));
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					return;
				}

				/* get the previous subject category topic */
				var promiseSubCatTop = queryPageDB.getPageSubjectCategoryTopic(connection,prefix,uid,pid);

				/* get username from user db */
				var promiseUsername = queryUserDB.getDocByUid(userdb,uid);

				Promise.all([promiseSubCatTop,promiseUsername]).then(function(values) {
					var prev_subcattop = values[0];
					var username = values[1][0].username;

					if(prev_subcattop.length < 1) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						return;
					}

					/* get previous redundant table name, if it exists */
					var pRed = queryPageDB.createRedundantTableName(prefix,prev_subcattop[0],prev_subcattop[1],prev_subcattop[2]);

					/* create user's table name */
					var uTable = prefix + "_" + uid + "_0";

					/* update user's table */
					var qryUpdateArray = ["UPDATE ",uTable," SET ","xname=",pagetitle,",subject=",subject,",category=",category,",topic=",topic,",imageurl=",imageurl,",blurb=",blurb,",edited=NOW() WHERE ","xid=",pid];

					var qryUpdate = qryUpdateArray.join("");
					connection.query(qryUpdate,function(err,rows,fields) {
						if(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = qryUpdate;
							analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							return;
						}

						/* get connection to update redundant tables */
						red.getConnection(function(err,connred) {
							if(err) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								analytics.journal(true,222,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								return;
							}

							/* get redundant table name */
							var cRed = queryPageDB.createRedundantTableName(prefix,subject,category,topic);

							if(cRed !== pRed) {
								/* insert into red */
								var qryInsertRed = `INSERT INTO xred.${cRed} (uid,xid,username,xname,created,edited,imageurl,blurb) SELECT '${uid}',${pid},'${username}',xname,created,edited,imageurl,blurb FROM xample.${uTable} WHERE xid=${pid}`;
								connred.query(qryInsertRed,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										err.input = qryInsertRed;
										analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								});

								/* delete from prev red */
								if(pRed) {
									var qryDeleteFromPrevRed = `DELETE FROM ${pRed} WHERE uid='${uid}' AND xid=${pid}`;
									connred.query(qryDeleteFromPrevRed,function(err,rows,fields) {
										if(err) {
											result.msg = 'err';
											err.input = qryDeleteFromPrevRed;
											analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									});
								}
							} else {
								/* update red */
								var qryUpdateRed = `UPDATE xred.${cRed},xample.${uTable} SET xred.${cRed}.xname = xample.${uTable}.xname , xred.${cRed}.username = '${username}' , xred.${cRed}.created = xample.${uTable}.created , xred.${cRed}.edited = xample.${uTable}.edited , xred.${cRed}.imageurl = xample.${uTable}.imageurl , xred.${cRed}.blurb = xample.${uTable}.blurb WHERE xred.${cRed}.xid = ${pid} AND xred.${cRed}.uid = '${uid}'`;
								connred.query(qryUpdateRed,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										err.input = qryUpdateRed;
										analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								});
							}

							result.msg = 'settingssaved';
							response.end(JSON.stringify(result));
							analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
						});
					});
				},function(err) {
					result.msg = 'err';
					response.end(JSON.stringify(result));
					analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				});
				connection.release();
            });
        });
	}
};
