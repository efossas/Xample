/* eslint-env node, es6 */
/*
	Title: Create Page
	Route for creating a page.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var querydb = require('./../querydb.js');

/*
	Function: createpage

	Ajax, handles the page creation routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.createpage = function(request,response) {
	var __function = "createpage";

	var qs = require('querystring');
	var fs = require('fs');

    var pool = request.app.get("pool");

	/* create response object */
	var result = {msg:"",data:{}};

	/* get the user's id */
	var uid = request.session.uid;

	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') {
		result.msg = 'nocreateloggedout';
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
                analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
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

					/* escape the page name to prevent Sql injection */
					var xname = connection.escape(POST.xname);
					var pagetype = connection.escape(POST.pt).replace(/'/g,"");

					var prefix = helper.getTablePrefixFromPageType(pagetype);

					/* check if page name exists */
					var promise = querydb.searchXnameMatch(connection,prefix,uid,xname);

					promise.then(function(match) {
						if(match) {
							result.msg = 'pageexists';
							response.end(JSON.stringify(result));
						} else {
							/* insert page into user's page table */
							var qryUser = "INSERT INTO " + prefix + "_" + uid + "_0 (xname,status,edited,created,ranks,views,rating,imageurl) VALUES (" + xname + ",1,NOW(),NOW(),0,0,0,'')";

							connection.query(qryUser,function(err,rows,fields) {
								if (err) {
									result.msg = 'err';
									response.end(JSON.stringify(result));
									err.input = qryUser;
									analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									/* grab the pid of the new page name from the user's page table */
									var promiseXid = querydb.getXidFromXname(connection,prefix,uid,xname);

									promiseXid.then(function(xid) {
										if(xid === "") {
											result.msg = 'err';
											response.end(JSON.stringify(result));
											var err = {message:"xid not found after page insert"};
											analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
										} else {
											/* create the page's permanent table */
											var qryPage = "CREATE TABLE " + prefix + "_" + uid + "_" + xid + " (bid TINYINT UNSIGNED, type CHAR(5), content VARCHAR(4096) )";

											connection.query(qryPage,function(err,rows,fields) {
												if (err) {
													result.msg = 'err';
													response.end(JSON.stringify(result));
													err.input = qryPage;
													analytics.journal(true,204,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
												}
											});

											var prefixTemp = helper.getTempTablePrefixFromPageType(pagetype);

											/* create the page's temporary table */
											var qryTemp = "CREATE TABLE " + prefixTemp + "_" + uid + "_" + xid + " (bid TINYINT UNSIGNED, type CHAR(5), content VARCHAR(4096) )";

											connection.query(qryTemp,function(err,rows,fields) {
												if (err) {
													result.msg = 'err';
													response.end(JSON.stringify(result));
													err.input = qryTemp;
													analytics.journal(true,205,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
												}
											});

											/* make a folder in user's media folder to store future media uploads */
											var dirPath = request.app.get('fileRoute') + "xm/" + uid + "/" + xid;
											fs.mkdir(dirPath,function(err) {
												/* don't consider existing folders as a mkdir error */
												if(err && err.code !== "EEXIST") {
													err.input = dirPath;
													analytics.journal(true,120,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
												}
											});
											result.msg = 'success';
											result.data.xid = xid.toString();
											response.end(JSON.stringify(result));
											analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
										}
									},function(error) {
										result.msg = 'err';
										response.end(JSON.stringify(result));
										analytics.journal(true,202,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
									});
								}
							});
						}
					},function(error) {
						result.msg = 'err';
						response.end(JSON.stringify(result));
						analytics.journal(true,200,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
					});
					connection.release();
				}
            });
		});
	}
};
