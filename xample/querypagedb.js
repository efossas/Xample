/* eslint-env node, es6 */
/*
	Title: QueryPageDB
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
		var qry = "SELECT gid FROM lg_" + uid + "_0 WHERE guidename=" + guidename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
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
		var qry = "SELECT guidename FROM lg_" + uid + "_0 WHERE guidename=" + guidename;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
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
	Function: getUidFromUsername

	This finds a the uid for a username.

	Parameters:

		connection - a MySQL connection
		username - the username to search, must have connection.escape() applied to it

	Returns:

		success - promise(string), uid or empty if not found
		error - promise(object), error information
*/
exports.getUidFromUsername = function(connection,username) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT uid FROM Users WHERE username = " + username;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].uid);
				} else {
					resolve("");
				}
			}
		});
	});

	return promise;
};

/*
	Function: searchXnameMatch

	This searches a user's table to see if a page name exists. This is used to ensure that user's don't create two or more pages with the same name.

	Parameters:

		connection - a MySQL connection
		prefix - the prefix for the database table
		uid - the user's id
		pagename - the page name to search for

	Returns:

		success - promise(int), 1 match or 0 no match
		error - promise(object), error information
*/
exports.searchXnameMatch = function(connection,prefix,uid,xname) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT xname FROM " + prefix + "_" + uid + "_0 WHERE xname=" + xname;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
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
	Function: createRedundantTableName

	Create database table name from content, subject, category, topic

	Parameters:

		content - string, "bp" or "lg"
		subject - string, the subject
		category - string, the category
		topic - string, the topic

	Returns:

		success - string, table name
		error - string, empty
*/
exports.createRedundantTableName = function(content,subject,category,topic) {

	/* ensure spaces are removed & create redundant table name */
	var tableArray = [];
	if(content) {
		tableArray.push("red");
		tableArray.push(content);
		/* table names use first two letters of each word */
		if(subject) {
			/* remove possible escape quotes */
			var sub = subject.replace(/[']/g,"");
			tableArray.push(sub.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
			if(category) {
				var cat = category.replace(/[']/g,"");
				tableArray.push(cat.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
				if(topic) {
					var top = topic.replace(/[']/g,"");
					tableArray.push(top.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
				}
			}
		} else {
			return "";
		}
	} else {
		return "";
	}
	var tableName = tableArray.join("_");
	return tableName;
};

/*
	Function: searchPageResults

	This the main explore search and retrieves matching result

	Parameters:

		connection - a MySQL connection
		content - string, "bp" or "lg"
		subject - string, the subject
		category - string, the category
		topic - string, the topic
		sort - string, what column to sort the data by
		btypes - string, binary flags to search block types
		tags - string, comma-separated tags

	Returns:

		success - promise, array of page objects
		error - promise, string of error
*/
exports.searchPageResults = function(connection,content,subject,category,topic,sort,btypes,tags) {
	var promise = new Promise(function(resolve,reject) {
		var tableName = exports.createRedundantTableName(content,subject,category,topic);

		/* convert binary string btypes to decimal number */
		var btypeDec = parseInt(btypes,2);

		/* get array of tags */
		var tagArray = tags.split(",");

		var qryTag;
		if(tagArray.length === 3) {
			qryTag = [" AND '",tagArray[0],"' IN(tagone, tagtwo, tagthree) "," AND '",tagArray[1],"' IN(tagone, tagtwo, tagthree) "," AND '",tagArray[2],"' IN(tagone, tagtwo, tagthree)"].join("");
		} else if(tagArray.length === 2) {
			qryTag = [" AND '",tagArray[0],"' IN(tagone, tagtwo, tagthree) "," AND '",tagArray[1],"' IN(tagone, tagtwo, tagthree)"].join("");
		} else if(tagArray.length === 1 && tagArray[0] !== "") {
			qryTag = [" AND '",tagArray[0],"' IN(tagone, tagtwo, tagthree)"].join("");
		}

		/* create the qry */
		var qryArray = ["SELECT uid,xid,xname,username AS author,created,edited,ranks,views,rating,imageurl,blurb FROM ",tableName," WHERE ",btypeDec," = btypes & ",btypeDec,qryTag," ORDER BY ",sort," ASC LIMIT 50"];

		var qry = qryArray.join("");

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				resolve(rows);
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
		prefix - the prefix for the database table
		uid - the user's id
		pid - the page id

	Returns:

		success - promise(object), page settings or err property with 'notfound'
		error - promise(object), error information
*/
exports.getPageSettings = function(connection,prefix,uid,pid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT xid,xname,username,subject,category,topic,tagone,tagtwo,tagthree,created,edited,ranks,views,rating,imageurl,blurb FROM " + prefix + "_" + uid + "_0 WHERE xid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0]);
				} else {
					resolve({err:'notfound'});
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
		prefix - the prefix for the database table
		uid - the user's id
		pid - the page id

	Returns:

		success - promise, array [subject,category,topic]
		error - promise, empty array
*/
exports.getPageSubjectCategoryTopic = function(connection,prefix,uid,xid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT subject,category,topic FROM " + prefix + "_" + uid + "_0 WHERE xid=" + xid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					if(rows[0].subject === null) {
						rows[0].subject = '';
						rows[0].category = '';
						rows[0].topic = '';
					} else if (rows[0].category === null) {
						rows[0].category = '';
						rows[0].topic = '';
					} else if (rows[0].topic === null) {
						rows[0].topic = '';
					}
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
	Function: getXidFromXname

	This finds a the pid for a user's page.

	Parameters:

		connection - a MySQL connection
		prefix - the prefix for the database table
		uid - the user's id
		pagename - the pagename to search for

	Returns:

	success - promise(string), xid or empty if not found
	error - promise(object), error information
*/
exports.getXidFromXname = function(connection,prefix,uid,xname) {
	var promise = new Promise(function(resolve,reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT xid FROM " + prefix + "_" + uid + "_0 WHERE xname=" + xname;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].xid);
				} else {
					resolve("");
				}
			}
		});
	});

	return promise;
};

/*
	Function: getStatusFromXid

	This finds the save status of a user's page.

	Parameters:

		connection - a MySQL connection
		prefix - the prefix for the database table
		uid - the user's id
		xid - the page id

	Returns:

		success - promise(int), status [1,0] or -1 for not found
		error - promise(object), error information
*/
exports.getStatusFromXid = function(connection,prefix,uid,xid) {
	var promise = new Promise(function(resolve,reject) {

		var qry = "SELECT status FROM " + prefix + "_" + uid + "_0 WHERE xid=" + xid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
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

		var qry = "SELECT * FROM " + redTable + " WHERE uid=" + uid + " AND xid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
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
		var qry = "UPDATE bp_" + uid + "_0 SET pagename=" + pagename + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				err.input = qry;
				reject(err);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
};
