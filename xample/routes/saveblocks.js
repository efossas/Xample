/* eslint-env node, es6 */
/*
	Title: Save Blocks
	Route for saving blocks & other info on page.
*/

var analytics = require('./../analytics.js');
var filemedia = require('./../filemedia.js');
var helper = require('./../helper.js');
var querydb = require('./../querydb.js');

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
                if(err) {
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
					var prefixTemp = helper.getTempTablePrefixFromPageType(pagetype);

					var qryStatus = "UPDATE " + prefix + "_" + uid + "_0 SET status=1 WHERE xid=" + xid;

					var tid;
					if(tabid) {
						tid = prefix;
					} else {
						tid = prefixTemp;
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
					var types = mediaType.split(',');
					var contents = mediaContent.split(',');

					/* this is saving the tags, only on permanent saves & block pages */
					if(tabid && pagetype === "page") {
						var promiseSettings = querydb.getPageSettings(connection,prefix,uid,xid);

						promiseSettings.then(function(data) {
							var tagTypes = new Map([["slide",0],["video",1],["audio",2],["image",4],["slide",4],["xtext",8],["xmath",16],["latex",16],["xcode",32]]);

							var tags = 0;
							types.forEach(function(element,index) {
								tags = tagTypes.get(element) | tags;
							});

							var qryTag = "UPDATE " + prefix + "_" + uid + "_0 SET tags=" + tags + ",edited=NOW() WHERE xid=" + xid;

							connection.query(qryTag,function(err,rows,fields) {
								if(err) {
									err.input = qryTag;
									analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* copy tags to redundant table */
									var redundantTableName = querydb.createRedundantTableName(prefix,data.subject,data.category,data.topic);

									var qryCopy = `UPDATE ${redundantTableName}, ${prefix}_${uid}_0 SET ${redundantTableName}.tags=${prefix}_${uid}_0.tags WHERE ${redundantTableName}.uid=${uid} AND ${redundantTableName}.xid=${xid} AND ${prefix}_${uid}_0.xid=${xid};`;

									connection.query(qryCopy,function(err,rows,fields) {
										if(err) {
											err.input = qryCopy;
											analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									});
								}
							});
						},function(error) {
							analytics.journal(true,203,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
						});
					}

					/* truncate (remove all rows) from the table */
					var qryTruncate = "TRUNCATE TABLE " + tid + "_" + uid + "_" + xid;

					connection.query(qryTruncate,function(err,rows,fields) {
						if(err) {
							result.msg = 'err';
							response.end(JSON.stringify(result));
							err.input = qryTruncate;
							analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							/* check that blocks exist to be saved */
							if(types[0] !== 'undefined') {

								/* create the query and remove unused media from user's page folder as well */
								var qryInsert = "INSERT INTO " + tid + "_" + uid + "_" + xid + " (bid,type,content) VALUES ";

								var i = 0;
								var stop = types.length - 1;

								while(i < stop) {
									qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + "),";
									i++;
								}
								qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + ")";

								/* save the blocks */
								connection.query(qryInsert,function(err,rows,fields) {
									if(err) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										err.input = qryInsert;
										analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									} else {
										/* only delete unused files on permanent table saves */
										if(tid === "bp") {
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
								if(tid === "bp") {
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
