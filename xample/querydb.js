/* eslint-env node, es6 */
/*
	Title: QueryDB
	Contains functions for querying the database.
*/

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
		var qry = "SELECT pagename FROM u_" + uid + " WHERE pagename=" + pagename;

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
		var qry = "SELECT pid FROM u_" + uid + " WHERE pagename=" + pagename;

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

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT status FROM u_" + uid + " WHERE pid=" + pid;

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

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "UPDATE u_" + uid + " SET pagename=" + pagename + " WHERE pid=" + pid;

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
