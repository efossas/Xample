/* eslint-env node, es6 */
/*
	Title: Save Page Settings
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var querydb = require('./../querydb.js');

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
            pool.getConnection(function(err,connection) {
                if(err) {
					result.msg = 'err';
                    response.end(JSON.stringify(result));
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
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
					} else if (!pagetype) {
						result.msg = 'invalidpagetype';
						response.end(JSON.stringify(result));
						analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
					} else {
						var promise = querydb.getPageSubjectCategoryTopic(connection,prefix,uid,pid);

						promise.then(function(a_data) {
							if(a_data.length < 1) {
								result.msg = 'err';
								response.end(JSON.stringify(result));
								analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								/* update user's table */
								var qryUpdateArray = ["UPDATE ",prefix,"_",uid,"_0 SET ","xname=",pagetitle,",subject=",subject,",category=",category,",topic=",topic,",imageurl=",imageurl,",blurb=",blurb,",edited=NOW() WHERE ","xid=",pid];

								var qryUpdate = qryUpdateArray.join("");

								connection.query(qryUpdate,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										err.input = qryUpdate;
										analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									} else {
										/* get redundant table name */
										var redundantTableName = querydb.createRedundantTableName(prefix,subject,category,topic);

										/* search if this page is already saved in this redundant table */
										var promiseRed = querydb.searchRedundantTable(connection,uid,pid,redundantTableName);

										promiseRed.then(function(exists) {
											/* if it exists, update, otherwise, insert into it */
											var qryCopy;
											if(exists) {
												qryCopy = `UPDATE ${redundantTableName}, ${prefix}_${uid}_0 SET ${redundantTableName}.xname=${prefix}_${uid}_0.xname,${redundantTableName}.created=${prefix}_${uid}_0.created,${redundantTableName}.edited=${prefix}_${uid}_0.edited,${redundantTableName}.ranks=${prefix}_${uid}_0.ranks,${redundantTableName}.views=${prefix}_${uid}_0.views,${redundantTableName}.imageurl=${prefix}_${uid}_0.imageurl,${redundantTableName}.blurb=${prefix}_${uid}_0.blurb WHERE ${redundantTableName}.uid=${uid} AND ${redundantTableName}.xid=${pid} AND ${prefix}_${uid}_0.xid = ${pid}`;
											} else {
												qryCopy = `INSERT INTO ${redundantTableName} (uid,xid,xname,tags,created,edited,ranks,views,rating,imageurl,blurb) SELECT ${uid},xid,xname,tags,created,edited,ranks,views,rating,imageurl,blurb FROM ${prefix}_${uid}_0 WHERE xid=${pid}`;
											}

											connection.query(qryCopy,function(err,rows,fields) {
												if(err) {
													result.msg = 'err';
													response.end(JSON.stringify(result));
													err.input = qryCopy;
													analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
												} else {
													/* get previous redundant table name, if it exists */
													var prevRedundantTable = querydb.createRedundantTableName(prefix,a_data[0],a_data[1],a_data[2]);

													/* delete row from previous redundant table if needed */
													if(prevRedundantTable && redundantTableName !== prevRedundantTable) {
														/* delete row from previous redundant table */
														var qryDeletePrev = "DELETE FROM " + prevRedundantTable + " WHERE uid=" + uid + " AND xid=" + pid;

														connection.query(qryDeletePrev,function(err,rows,fields) {
															if(err) {
																result.msg = 'err';
																response.end(JSON.stringify(result));
																err.input = qryDeletePrev;
																analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
															} else {
																result.msg = 'settingssaved';
																response.end(JSON.stringify(result));
																analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
															}
														});
													} else {
														result.msg = 'settingssaved';
														response.end(JSON.stringify(result));
														analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
													}

												}
											});
										},function(err) {
											result.msg = 'err';
											response.end(JSON.stringify(result));
											analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										});
									}
								});
							}
						},function(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						});
					}

					connection.release();
				}
            });
        });
	}
};
