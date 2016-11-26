/* eslint-env node, es6 */
/*
	Title: QueryDB
	Contains functions for querying the database.
*/

/*
	Function: searchGid

	This finds the gid for a user's learning guide.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pagename - the pagename to search for

	Returns:

		success - promise, gid
		error - promise, -1
*/
exports.searchGid = function(connection,uid,guidename) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT gid FROM g_" + uid + " WHERE guidename=" + guidename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].gid);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchGuidename

	This searches a user's table to see if a guidename exists. This is used to ensure that user's don't create two or more guides with the same name.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		guidename - the guide name to search for

	Returns:

		success - promise, the guide name
		error - promise, -1
*/
exports.searchGuidename = function(connection,uid,guidename) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT guidename FROM g_" + uid + " WHERE guidename=" + guidename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].guidename);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchUid

	This finds a the uid for a username.

	Parameters:

		connection - a MySQL connection
		username - the username to search, must have connection.escape() applied to it

	Returns:

		success - promise, uid
		error - promise, -1
*/
exports.searchUid = function(connection,username) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT uid FROM Users WHERE username = " + username;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].uid);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchPagename

	This searches a user's table to see if a pagename exists. This is used to ensure that user's don't create two or more pages with the same name.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pagename - the page name to search for

	Returns:

		success - promise, the page name
		error - promise, -1
*/
exports.searchPagename = function(connection,uid,pagename) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pagename FROM p_" + uid + " WHERE pagename=" + pagename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].pagename);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: getPageSettings

	This searches user's table and returns all of the page's adjustable settings

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pid - the page id

	Returns:

		success - promise, json object
		error - promise, empty array
*/
exports.getPageSettings = function(connection,uid,pid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT pid,pagename,subject,category,topic,tags,imageurl,blurb FROM p_" + uid + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0]);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: getPageSubjectCategoryTopic

	This searches user's table and returns a page's subject, category, and topic.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pid - the page id

	Returns:

		success - promise, array [subject,category,topic]
		error - promise, empty array
*/
exports.getPageSubjectCategoryTopic = function(connection,uid,pid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT subject,category,topic FROM p_" + uid + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve([rows[0].subject,rows[0].category,rows[0].topic]);
				} else {
					resolve([]);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchPid

	This finds a the pid for a user's page.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pagename - the pagename to search for

	Returns:

		success - promise, pid
		error - promise, -1
*/
exports.searchPid = function(connection,uid,pagename) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pid FROM p_" + uid + " WHERE pagename=" + pagename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].pid);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchPageStatus

	This finds the save status of a user's page.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pid - the page id

	Returns:

		promise - number

	Return Values:
		success - 0 temp || 1 perm
		error - -1
*/
exports.searchPageStatus = function(connection,uid,pid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT status FROM p_" + uid + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(Number(rows[0].status));
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchRedundantTable

	Search and return a row in a redundant table matching a user's page.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pid - the page id
		redTable - the name of the redundant table

	Returns:

		promise - number

	Return Values:
		success - 0 does not exist || 1 does exist
		error - error string
*/
exports.searchRedundantTable = function(connection,uid,pid,redTable) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT * FROM " + redTable + " WHERE uid=" + uid + " AND pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(1);
				} else {
					resolve(0);
				}
			}
		});
	});

	return promise;
};

/*
	Function: changePagename

	This changes the name of a user's page.

	Parameters:

		connection - a MySQL connection
		uid - the user's id
		pid - the page's id
		pagename - the new page name that will replace the old one

	Returns:

		success - promise, pid
		error - promise, -1
*/
exports.changePagename = function(connection,uid,pid,pagename) {
	var promise = new Promise(function(resolve,reject) {

		/* pagename must have connection.escape() already applied, which adds '' */
		var qry = "UPDATE p_" + uid + " SET pagename=" + pagename + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				reject(err);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
};
