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

				var tid;
				var qryStatus;
				/* 1 -> perm, 0 -> temp */
				if(xname === "bp") {
					switch(POST.tabid) {
						case '0':
							tid = "t_";
							break;
						default:
							tid = "p_";
							break;
					}
					qryStatus = "UPDATE p_" + uid + " SET status=1 WHERE pid=" + xid;
				} else if(xname === "lg") {
					switch(POST.tabid) {
						case '0':
							tid = "c_";
							break;
						default:
							tid = "g_";
							break;
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

                /* truncate (remove all rows) from the table */
				var qryTruncate = "TRUNCATE TABLE " + tid + uid + "_" + xid;

				connection.query(qryTruncate,function(err,rows,fields) {
					if(err) {
						response.end('err');
						analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
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
									analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
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
