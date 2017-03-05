/* eslint-env node, es6 */
/*
	Title: Helper
	General helper functions for routes.
*/

exports.determineView = function(request,response,pagetype,cachedb,uid,aid,xid) {
	var __function = "determineView";

	var promise = new Promise(function(resolve,reject) {
        var redPrefix;
        switch(pagetype) {
            case 'page':
                redPrefix = 'p'; break;
            case 'guide':
                redPrefix = 'g'; break;
            default:
                reject('invalide pagetype');
        }

		if(uid) {
			var vkey = 'p' + aid + xid + ':' + uid;
			cachedb.get(vkey,function(err,data) {
				if(err) {
					reject(err);
				} else if(data === null) {
					cachedb.setex(vkey,120,Date.now(),function(err,data) {
						if(err) {
							reject(err);
						}
					});
				} else if(data === '0') {
                    /* view already logged */
                } else {
                    var redTime = Number(data) + 60000;
                    if(redTime < Date.now()) {
                        cachedb.setex(vkey,14400,'0',function(err,data) {
                            if(err) {
                                reject(err);
                            }
                        });
                        /* log verified view */
                        var pool = request.app.get("pool");
                        pool.getConnection(function(err,connection) {
                            if(err) {
                                reject(err);
                            } else {
                                /* quality of view, verfied or not */
                                var quality = 1;
                                registerView(connection,uid,quality,pagetype,aid,xid);
                            }
                        });
                    }
				}
			});
		} else {
			/* look for cookie from previous visit */
			var ckid = request.cookies['id'];

			/* if no cookie, register ip address instead */
            var ukey;
			if(typeof ckid === 'undefined') {
                var tempUid = randomText();
                ukey = 'p' + aid + xid + ':' + tempUid;
				response.cookie('id',tempUid,{maxAge:57600000}); // 16 hrs
                cachedb.setex(ukey,120,Date.now(),function(err,data) {
                    if(err) {
                        reject(err);
                    }
                });
			} else {
                /* do some cookie id validation */
                if(ckid.length !== 8) {
                    reject('invalid cookie id');
                } else {
                    ukey = 'p' + aid + xid + ':' + ckid;
                    cachedb.get(ukey,function(err,data) {
                        if(err) {
                            reject(err);
                        } else if(data === null) {
                            cachedb.setex(ukey,120,Date.now(),function(err,data) {
                                if(err) {
                                    reject(err);
                                }
                            });
                        } else if(data === '0') {
                            /* view already logged */
                        } else {
                            var redTime = Number(data) + 60000;
                            if(redTime < Date.now()) {
                                /* log verified view */
                                var pool = request.app.get("pool");
                                pool.getConnection(function(err,connection) {
                                    if(err) {
                                        reject(err);
                                    } else {
                                        /* quality of view, verfied or not */
                                        var quality = 0;
                                        registerView(connection,uid,quality,pagetype,aid,xid);
                                    }
                                });

                                /* prevent repeat log */
                                cachedb.setex(ukey,14400,'0',function(err,data) {
                                    if(err) {
                                        reject(err);
                                    }
                                });
                            }
                        }
                    });
                }
			}
		}
		resolve('');
	});

	promise.then(function(success) {
		// ignore success
	},function(err) {
		var analytics = require('./analytics.js');
		analytics.journal(true,200,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
	});
};

function escapeForDB(text) {
	var str = text.replace(/<script[^>]*>/g,"").replace(/<\/script>/g,"").replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR").replace(/'/g,"%27");
	return encodeURIComponent(str);
}

exports.escapeForDB = escapeForDB;

function registerView(connection,uid,quality,pagetype,aid,xid) {
    var __function = "registerView";

    var analytics = require('./analytics.js');

    var prefix = getTablePrefixFromPageType(pagetype);
    var pageTable = prefix + '_' + aid + '_0';

    /* update the views on the page table */
    var qryUpdate = 'UPDATE ' + pageTable + ' SET views = views + 1 WHERE xid=' + xid;
    connection.query(qryUpdate,function(err,rows,fields) {
        if(err) {
            analytics.journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
        } else {
            /* determine if a redundant table exists */
            var qryRed = 'SELECT subject,category,topic FROM ' + pageTable + ' WHERE xid=' + xid;
            connection.query(qryRed,function(err,rows,fields) {
                if(err) {
                    analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                } else {
                    /* if exists, update redundant table */
                    if(rows[0].subject) {
                        var queryPageDB = require('./querypagedb.js');
                        var redTable = queryPageDB.createRedundantTableName(prefix,rows[0].subject,rows[0].category,rows[0].topic);

                        var qryRedUpdate = `UPDATE xred.${redTable},xample.${pageTable} SET xred.${redTable}.views = xample.${pageTable}.views WHERE xred.${redTable}.xid = ${xid} AND xred.${redTable}.uid = '${aid}' AND xample.${pageTable}.xid = ${xid}`;
                        connection.query(qryRedUpdate,function(err,rows,fields) {
                            if(err) {
                                analytics.journal(true,203,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                            }
                        });
                    }
                }
            });
        }
    });

    /* save extra stats data about view */
    analytics.saveViewData(uid,quality,pagetype,aid,xid);
}

exports.registerView = registerView;

/*
	Function: getTablePrefixFromPageType

	Given a page type ["page","guide"], this returns the table prefix used in the database.

	Parameters:

		pagetype - string, ["page","guide"]

	Returns:

		success - string, table prefix
        error - string, empty
*/
function getTablePrefixFromPageType(pagetype) {

    var prefix;
	switch(pagetype) {
        case "page":
            prefix = "bp"; break;
        case "guide":
            prefix = "lg"; break;
        default:
            prefix = "";
    }

    return prefix;
}

exports.getTablePrefixFromPageType = getTablePrefixFromPageType;

/*
	Function: randomText

	This returns a random string of 8 characters. It's used to generate random file names.

	Parameters:

		none

	Returns:

		success - string, 8 char string
*/
function randomText() {

	/* initialize return variable & list of charachters to grab from */
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	/* choose a random character and append it to "text". Do this 8 times */
    for(var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

exports.randomText = randomText;
