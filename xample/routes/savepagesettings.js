/* eslint-env node, es6 */
/*
	Title: Save Page Settings
	Route for saving profile data.
*/

var analytics = require('./../analytics.js');
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

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
        response.end('nosaveloggedout');
    } else {

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data',function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
				request.connection.destroy();
				analytics.journal(true,199,"Overload Attack!",uid,global.__stack[1].getLineNumber(),__function,__filename);
			}
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                }

                var POST = qs.parse(body);
				var pid = connection.escape(POST.pid).replace(/'/g,"");
				var pagetitle = connection.escape(POST.p);
				var subject = connection.escape(POST.s);
				var subjectNoSQ = subject.replace(/[ ']/g,"");
				var category = connection.escape(POST.c);
				var categoryNoSQ = category.replace(/[ ']/g,"");
				var topic = connection.escape(POST.t);
				var topicNoSQ = topic.replace(/[ ']/g,"");
				var tags = connection.escape(POST.g);
				var imageurl = connection.escape(POST.i);
				var blurb = connection.escape(POST.b);

				/// add check that subject category topic actually exists
				/// extend this route for learning guides

				if(subjectNoSQ === "") {
					response.end('nosubjectnotsaved');
					analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
				} else {
					var promise = querydb.getPageSubjectCategoryTopic(connection,uid,pid);

					promise.then(function(a_data) {
						if(a_data.length < 1) {
							analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							response.end("databaseerror");
						} else {
							/* update user's table */
							var qryUpdate = "UPDATE p_" + uid + " SET pagename=" + pagetitle + ",subject=" + subject + ",category=" + category + ",topic=" + topic + ",imageurl=" + imageurl + ",blurb=" + blurb + ",edited=NOW() WHERE pid=" + pid;

							connection.query(qryUpdate,function(err,rows,fields) {
								if(err) {
									response.end('err');
									analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* get redundant table name */
									var redundantTableArray = ["bp_",subjectNoSQ];
									if(categoryNoSQ !== "") {
										redundantTableArray.push("_");
										redundantTableArray.push(categoryNoSQ);
										if(topicNoSQ !== "") {
											redundantTableArray.push("_");
											redundantTableArray.push(topicNoSQ);
										}
									}
									var redundantTableName = redundantTableArray.join("");

									/* search if this page is already saved in this redundant table */
									var promiseRed = querydb.searchRedundantTable(connection,uid,pid,redundantTableName);

									promiseRed.then(function(result) {

										/* if it exists, update, otherwise, insert into it */
										var qryCopy;
										if(result) {
											qryCopy = `UPDATE ${redundantTableName}, p_${uid} SET ${redundantTableName}.pagename=p_${uid}.pagename,${redundantTableName}.tags=p_${uid}.tags,${redundantTableName}.created=p_${uid}.created,${redundantTableName}.edited=p_${uid}.edited,${redundantTableName}.ranks=p_${uid}.ranks,${redundantTableName}.views=p_${uid}.views,${redundantTableName}.imageurl=p_${uid}.imageurl,${redundantTableName}.blurb=p_${uid}.blurb WHERE ${redundantTableName}.uid=${uid} AND ${redundantTableName}.pid=${pid};`;
										} else {
											qryCopy = `INSERT INTO ${redundantTableName} (uid,pid,pagename,tags,created,edited,ranks,views,imageurl,blurb) SELECT ${uid},${pid},pagename,tags,created,edited,ranks,views,imageurl,blurb FROM p_${uid} WHERE pid=${pid}`;
										}

										connection.query(qryCopy,function(err,rows,fields) {
											if(err) {
												response.end('err');
												analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
											} else {
												/* get previous redundant table name, if it exists */
												var prevRedundantTable = "";
												if(a_data[0]) {
													var prevRedundantTableArray = ["bp_",a_data[0].replace(/ /g,"")];
													if(a_data[1].replace(/ /g,"")) {
														prevRedundantTableArray.push("_");
														prevRedundantTableArray.push(a_data[1].replace(/ /g,""));
														if(a_data[2].replace(/ /g,"")) {
															prevRedundantTableArray.push("_");
															prevRedundantTableArray.push(a_data[2].replace(/ /g,""));
														}
													}
													prevRedundantTable = prevRedundantTableArray.join("");
												}

												/* delete row from previous redundant table if needed */
												if(prevRedundantTable && redundantTableName !== prevRedundantTable) {
													/* delete row from previous redundant table */
													var qryDeletePrev = "DELETE FROM " + prevRedundantTable + " WHERE uid=" + uid + " AND pid=" + pid;

													connection.query(qryDeletePrev,function(err,rows,fields) {
														if(err) {
															response.end('err');
															analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
														} else {
															response.end('settingssaved');
															analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
														}
													});
												} else {
													response.end('settingssaved');
													analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
												}

											}
										});
									},function(err) {
										analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										response.end("databaseerror");
									});
								}
							});
						}
					},function(err) {
						analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						response.end("databaseerror");
					});
				}

                connection.release();
            });
        });
	}
};
