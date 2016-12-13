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
	Function: createRedundantTableName

	Create database table name from content, subject, category, topic

	Parameters:

		content - string, "bp" or "lg"
		subject - string, the subject
		category - string, the category
		topic - string, the topic

	Returns:

		success - promise, the page name
		error - promise, -1
*/
exports.createRedundantTableName = function(content,subject,category,topic) {
	/* remove possible escape quotes */
	var sub = subject.replace(/[']/g,"");
	var cat = category.replace(/[']/g,"");
	var top = topic.replace(/[']/g,"");

	/* ensure spaces are removed & create redundant table name */
	var tableArray = [];
	if(content) {
		tableArray.push(content);
		/* table names use first two letters of each word */
		if(subject) {
			tableArray.push(sub.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
			if(category) {
				tableArray.push(cat.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
				if(topic) {
					tableArray.push(top.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,""));
				}
			}
		} else {
			return "err";
		}
	} else {
		return "err";
	}
	var tableName = tableArray.join("_");
	return tableName;
};

/*
	Function: getPageContent

	This the main explore search and retrieves matching result

	Parameters:

		connection - a MySQL connection
		content - string, "bp" or "lg"
		subject - string, the subject
		category - string, the category
		topic - string, the topic
		sort - string, what column to sort the data by
		tags - string, binary number as string for block types
		keywords - string, used to search blurbs

	Returns:

		success - promise, array of page objects
		error - promise, string of error
*/
exports.getPageContent = function(connection,content,subject,category,topic,sort,tags,keywords) {
	var promise = new Promise(function(resolve,reject) {
		var tableName = exports.createRedundantTableName(content,subject,category,topic);

		/// ADD KEYWORD SEARCH IN BLURB

		/* convert binary string tags to decimal number */
		var tagDec = parseInt(tags,2);

		/* create the qry */
		var qryArray = ["SELECT uid,pid,pagename,created,edited,ranks,views,rating,imageurl,blurb FROM ",tableName," WHERE ",tagDec," = tags & ",tagDec," ORDER BY ",sort," ASC LIMIT 50"];
		var qry = qryArray.join("");

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
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
