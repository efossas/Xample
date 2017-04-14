/* eslint-env node, es6 */
/*
	Title: Save Blocks
	Route for saving blocks & other info on page.
*/

var analytics = require('./../analytics.js');
var filemedia = require('./../filemedia.js');
var helper = require('./../helper.js');
var querypagedb = require('./../querypagedb.js');

/*
	Function: saveblocks

	Ajax, used to save the page content to the page table. The previous page table rows are deleted and new ones are added.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.saveblocks = function(request,response) {
	var __function = "saveblocks";

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

        /* when the request ends,parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err || typeof connection === 'undefined') {
					result.msg = 'err';
					response.end(JSON.stringify(result));
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
					var POST = qs.parse(body);

					/* change info as needed */
					var xid = POST.xid;
					var pagetype = POST.pagetype;
					var mediaType = POST.mediaType;
					var mediaContent = POST.mediaContent;
					var tabid = Number(POST.tabid);

					var prefix = helper.getTablePrefixFromPageType(pagetype);

					var uTable = prefix + "_" + uid + "_0";
					var bTable = prefix + "_" + uid + "_" + xid;
					var qryStatus;

					var tid;
					if(tabid) {
						tid = "p";
						qryStatus = "UPDATE " + uTable + " SET status=1 WHERE xid=" + xid;
					} else {
						tid = "t";
						qryStatus = "UPDATE " + uTable + " SET status=0 WHERE xid=" + xid;
					}

					/* this is changing the temp || perm save status */
					connection.query(qryStatus,function(err,rows,fields) {
						if(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = qryStatus;
							analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						}
					});

					/* get arrays of the media types and content */
					var types = mediaType.split('@^@');
					var contents = mediaContent.split('@^@');

					/* validate block length */
					if(types.length !== contents.length) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						var error = {input:"saveblocks: not equal types and contents lengths"};
						analytics.journal(true,201,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
						return;
					} else if(types.length > 8 && request.session.auth < 6) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						return;
					} else if(types.length > 16) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						return;
					}

					/* this is saving the btypes, only on permanent saves & block pages */
					if(tabid && pagetype === "page") {
						var promiseSettings = querypagedb.getPageSettings(connection,prefix,uid,xid);
						promiseSettings.then(function(data) {
							var bTypeMap = new Map([["none",0],["video",1],["audio",2],["image",4],["slide",4],["xtext",8],["xmath",16],["latex",16],["xcode",32]]);

							var btypes = 0;
							types.forEach(function(element,index) {
								btypes = bTypeMap.get(element) | btypes;
							});

							var qryTag = "UPDATE " + uTable + " SET btypes=" + btypes + ",edited=NOW() WHERE xid=" + xid;

							connection.query(qryTag,function(err,rows,fields) {
								if(err) {
									err.input = qryTag;
									analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* copy btypes to redundant table, if exists */
									if(data.subject) {
										var cRed = querypagedb.createRedundantTableName(prefix,data.subject,data.category,data.topic);

										var qryCopy = `UPDATE xred.${cRed}, xample.${uTable} SET xred.${cRed}.btypes = xample.${uTable}.btypes WHERE xred.${cRed}.uid = '${uid}' AND xred.${cRed}.xid = ${xid} AND xample.${uTable}.xid = ${xid};`;

										connection.query(qryCopy,function(err,rows,fields) {
											if(err) {
												err.input = qryCopy;
												analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
											}
										});
									}
								}
							});
						},function(error) {
							analytics.journal(true,204,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
						});
					}

					/* remove all rows from the table if perm, if temp remove just temp rows */
					var qryTruncate;
					if(tid === 'p') {
						qryTruncate = "TRUNCATE TABLE " + bTable;
					} else {
						qryTruncate = "DELETE FROM " + bTable + " WHERE bt='" + tid
						+ "'";
					}

					connection.query(qryTruncate,function(err,rows,fields) {
						if(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = qryTruncate;
							analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							/* check that blocks exist to be saved */
							if(types[0] !== 'undefined') {

								/* create the query and remove unused media from user's page folder as well */
								var qryInsert = "INSERT INTO " + bTable + " (bid,type,content,bt) VALUES ";

								var i = 0;
								var stop = types.length - 1;

								while(i < stop) {
									qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(helper.escapeForDB(contents[i])) + ",'" + tid + "'),";
									i++;
								}
								qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(helper.escapeForDB(contents[i])) + ",'" + tid + "')";

								/* save the blocks */
								connection.query(qryInsert,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										err.input = qryInsert;
										analytics.journal(true,206,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									} else {
										/* only delete unused files on permanent table saves */
										if(tid === 'p') {
											filemedia.deleteMedia(connection,request.app.get('fileRoute'),uid,xid);
										}

										result.msg = 'blocksaved';
										response.end(JSON.stringify(result));
										analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								});
							} else {
								/* in this case, only page save, since no blocks */
								result.msg = 'blocksaved';
								response.end(JSON.stringify(result));

								/* there could have been blocks deleted though, so delete if perm save */
								if(tid === 'p') {
									filemedia.deleteMedia(connection,request.app.get('fileRoute'),uid,xid);
								}
								analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
							}
						}
					});
					connection.release();
				}
            });
		});
	}
};
