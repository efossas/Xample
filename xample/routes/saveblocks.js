/* eslint-env node, es6 */
/*
	Title: Save Blocks
	Route for saving blocks & other info on page.
*/

var analytics = require('./../analytics.js');
var querydb = require('./../querydb.js');
var filemedia = require('./../filemedia.js');

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

        /* when the request ends,parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err,connection) {
                if(err) {
                    analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                }

                var POST = qs.parse(body);

                /* change info as needed */
                var xid = POST.xid;
				var xname = POST.xname;
                var mediaType = POST.mediaType;
                var mediaContent = POST.mediaContent;
				var tabid = Number(POST.tabid);

				var tid;
				var qryStatus;
				/* 1 -> perm, 0 -> temp */
				if(xname === "bp") {
					if(tabid) {
						tid = "p_";
					} else {
						tid = "t_";
					}
					qryStatus = "UPDATE p_" + uid + " SET status=1 WHERE pid=" + xid;
				} else if(xname === "lg") {
					if(tabid) {
						tid = "g_";
					} else {
						tid = "c_";
					}
					qryStatus = "UPDATE g_" + uid + " SET status=1 WHERE gid=" + xid;
				} else {
					/// else throw invalid parameter error!!
				}

				/* this is changing the temp || perm save status */
                connection.query(qryStatus,function(err,rows,fields) {
                    if(err) {
                        response.end('err');
                        analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                    }
                });

                /* get arrays of the media types and content */
                var types = mediaType.split(',');
                var contents = mediaContent.split(',');

				/* this is saving the tags, only on permanent saves & block pages */
				if(tabid && xname === "bp") {
					var promiseSettings = querydb.getPageSettings(connection,uid,xid);
					promiseSettings.then(function(data) {
						var tagTypes = new Map([["slide",0],["video",1],["audio",2],["image",4],["slide",4],["xtext",8],["xmath",16],["latex",16],["xcode",32]]);

						var tags = 0;
						types.forEach(function(element,index) {
							tags = tagTypes.get(element) | tags;
						});

						var qryTag = "UPDATE p_" + uid + " SET tags=" + tags + ",edited=NOW() WHERE pid=" + xid;
						connection.query(qryTag,function(err,rows,fields) {
							if(err) {
								response.end('err');
								analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
							} else {
								/* copy tags to redundant table */
								var redundantTableName = querydb.createRedundantTableName("bp",data.subject,data.category,data.topic);
								var qryCopy = `UPDATE ${redundantTableName}, p_${uid} SET ${redundantTableName}.tags=p_${uid}.tags WHERE ${redundantTableName}.uid=${uid} AND ${redundantTableName}.pid=${xid};`;

								connection.query(qryCopy,function(err,rows,fields) {
									if(err) {
										response.end('err');
										analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
									}
								});
							}
						});
					},function(error) {
						/// handle error
					});
				}

                /* truncate (remove all rows) from the table */
				var qryTruncate = "TRUNCATE TABLE " + tid + uid + "_" + xid;

				connection.query(qryTruncate,function(err,rows,fields) {
					if(err) {
						response.end('err');
						analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
					} else {

						/* check that blocks exist to be saved */
						if(types[0] !== 'undefined') {

							/* create the query and remove unused media from user's page folder as well */
							var qryInsert = "INSERT INTO " + tid + uid + "_" + xid + " (bid,type,content) VALUES ";

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
									response.end('err');
									analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* only delete unused files on permanent table saves */
									if(tid === "p_") {
										filemedia.deleteMedia(connection,request.app.get('fileRoute'),uid,xid);
									}
									response.end('blockssaved');
									analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
								}
							});
						} else {
							/* in this case, only page save, since no blocks */
							response.end('blockssaved');
                            /* there could have been blocks deleted though, so delete if perm save */
                            if(tid === "p_") {
                                filemedia.deleteMedia(connection,request.app.get('fileRoute'),uid,xid);
                            }
							analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
						}
					}
				});
                connection.release();
            });
		});
	}
};
