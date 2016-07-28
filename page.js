/*
	Title: Page
	This is the back-end for Xample
*/

/*
	Section: Prototypes
	These are additions or changes to js prototypes
	
	Object - __stack, __line, __function, are all set using v8 engine stacktrace API functions
*/

/* These set __line to return the current line number where they are used. They are used for logging errors.  */
Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
get: function() {
        return __stack[1].getLineNumber();
    }
});

/*
	Section: Globals
	These are the global variables xample uses
	
	domain - the domain name, used for links
	reroute - used to reroute paths from the server location to the public_html, the domain's base path
*/

// reroute to your version of the front-end & your database
var g_frontend = "navigation.js";
var g_mediaFolder = "xample-media";
var g_xmain = "xample";
var g_xjournal = "xanalytics";

var g_domain = "http://abaganon.com/";
var g_reroute = "../public_html/";

/*
	Section: MySql Connection
	Imports the MySQL module and sets up the connection pool
*/

var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 100,
  host     : 'localhost',
  user     : 'nodesql',
  password : 'Vup}Ur34',
  database : g_xmain
});

var stats = mysql.createPool({
  connectionLimit : 100,
  host     : 'localhost',
  user     : 'nodesql',
  password : 'Vup}Ur34',
  database : g_xjournal
});

/*
	Section: Helper Functions
	These are functions that are either used in several routes or are just separated for clarity
*/	

/*
	Function: journal
	
	This is used to log data to an analytics database. Actions and errors should be logged with this.
	
	Parameters:
	
		isError - boolean, true for logging to error database, false for logging to action database.
		idNumber - number, id number for the error or action. (0-255 only)
		userID - number, user ID associated with log. set to 0 if not applicable.
		message - string, the error message, if there is one.
		lineNumber - number, line number where the error or action occurred. should be set with global __line
		functionName - string, function where the error or action occurred. define __function
		scriptName - string, script file where the error or action occurred. shooud be set with global __filename
	
	Returns:
	
		nothing - *
*/
function journal(isError,idNumber,message,userID,lineNumber,functionName,scriptName) {
	fileName = scriptName.split("/").pop();
	
	stats.getConnection(function(err, connection) {
		
		var qry = "";
		if(isError) {
			qry = "INSERT INTO xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + connection.escape(message).replace(/['"`]+/g, '') + "')";
		} else {
			qry = "INSERT INTO xdata (scriptName, functionName, lineNumber, userID, eventTime) VALUES ('" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW() )";
		}
		
		connection.query(qry, function(err, rows, fields) {
			if (err) {
				console.log("FAILED JOURNAL QUERY: " + qry);
			}
		});
		
		connection.release();
	});
}

/*
	Function: loadPage
	
	This is used to load a page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.
	
	Parameters:
	
		response - the http response
		script - the front-end javascript function, it needs to have <script> tags
	
	Returns:
	
		nothing - *
*/
function loadPage(response,script) {
	
	/* define the library & style links here */
	var headstart = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
	var viewport = "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
	var alertifycorestyle = "<link rel='stylesheet' href='" + g_domain + "css/alertify.core.css'>";
	var alertifydefaultstyle = "<link rel='stylesheet' href='" + g_domain + "css/alertify.default.css'>";
	var codehighlightstyle = "<link rel='stylesheet' href='" + g_domain + "css/vs.css'>";
	var blockstyle = "<link rel='stylesheet' href='" + g_domain + "css/block.css'>";
	var alertifyjs = "<script src='" + g_domain + "xample-scripts/alertify.min.js'></script>";
	var pdfjs = "<script src='" + g_domain + "xample-scripts/pdf.min.js'></script>";
	var codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	var mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	var xamplejs = "<script src='" + g_domain + "xample-scripts/" + g_frontend + "'></script>";
	var mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";
	var headend = "<title>Abaganon Xample</title></head>";
	var body = "<body class='xample'><div id='content'></div>";
	
	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + codehighlightstyle + blockstyle + alertifyjs + pdfjs + codehighlightjs + mathjaxconfig + mathjaxjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("<footer></footer></body></html>");
}

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
function searchUid(connection,username) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT uid FROM Users WHERE username = " + username;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
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
}

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
function searchPagename(connection,uid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pagename FROM u_" + uid + " WHERE pagename=" + pagename;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
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
}

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
function searchPid(connection,uid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pid FROM u_" + uid + " WHERE pagename=" + pagename;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
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
}

/*
	Function: searchPageStatus
	
	This finds the save status of a user's page.
	
	Parameters:
	
		connection - a MySQL connection
		uid - the user's id
		pid - the page id
	
	Returns:
	
		success - promise, status (0 temp, 1 perm)
		error - promise, -1
*/
function searchPageStatus(connection,uid,pid) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT status FROM u_" + uid + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
			if(err) {
				reject(err);
			} else {
				if(typeof rows[0] !== 'undefined') {
					resolve(rows[0].status);
				} else {
					resolve(-1);
				}
			}
		});
	});

	return promise;
}

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
function changePagename(connection,uid,pid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "UPDATE u_" + uid + " SET pagename=" + pagename + " WHERE pid=" + pid;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
			if(err) {
				reject(err);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
}

/*
	Function: truncateTable
	
	This removes all rows from a user's page table. Page tables have their rows deleted before saving the new rows.
	
	Parameters:
	
		connection - a MySQL connection
		uid - the user's id
		pid - the page's id
	
	Returns:
	
		success - promise, 1
		error - promise, -1
*/
function truncateTable(connection,uid,pid) {
	var promise = new Promise(function(resolve, reject) {

		/* truncate (remove all rows) from the table */
		var qry = "TRUNCATE TABLE p_" + uid + "_" + pid;

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
			if(err) {
				reject(err);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
}

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
    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/*
	Function: removeMedia
	
	This runs a shell command to remove a file. This is called after an uploaded media has been converted to remove the old file.
	
	Parameters:
	
		file - the path to the file to remove, relative to the domain name (everything after .com/)
		uid - optional, user id, this is purely for debugging if something goes wrong
		pid - optional, page id, this is purely for debigging if something goes wrong
	
	Returns:
	
		success - number, 1
		error - number, -1
*/
function removeMedia(file,uid = 0,pid = 0) {
	var __function = "removeMedia";

	var exec = require('child_process').exec;
	var child;
    
    /* set up the remove command, "g_reroute" is a global variable defined at the top */
    command = "rm " + g_reroute + file;

	/* execute the remove command */
	child = exec(command, function (error, stdout, stderr) {
		if (error !== null) {
			journal(true,111,'Exec Error (removemedia) (uid:' + uid + ') (pid:' + pid + ' -> ' + stdout + stderr,0,__line,__function,__filename);
			return -1;
		}
		else {
			return 1;
		}
	});
}

/*
	Function: convertMedia
	
	This runs a shell command to convert media to html5 compatible media. Images are converted using imagemagick "convert". Audio & Video are converted using a static build of ffmpeg "ffmpeg/ffmpeg". Slides are converted using libreoffice "unoconv".
	
	Parameters:
	
		oldfile - the path to the file, relative to the domain name (everything after .com/)
		dir - the relative path to the folder that contains the file (everything after .com/)
		btype - the media type, "image" "audio" "video" "slide"
		uid - optional, user id, this is purely for debugging if something goes wrong
		pid - optional, page id, this is purely for debigging if something goes wrong
	
	Returns:
	
		success - promise, new file path, relative to the domain name
		error - promise, -1
*/
function convertMedia(oldfile,dir,btype,uid = 0,pid = 0) {
	var promise = new Promise(function(resolve, reject) {

		/* spawn the process */
		var exec = require('child_process').exec;
		var child;
        
        /* create the path to the new file & give it a random file name */
		var newfile = dir + randomText();

        /* determine the command based on media type, "reroute" is a global variable defined at top */
        switch(btype) {
            case "image":
            	newfile += ".jpg";
                var command = "convert " + g_reroute + oldfile + " -resize '1280x720>' " + g_reroute + newfile;
                break;
            case "audio":
            	newfile += ".mp3";
                var command = "ffmpeg/ffmpeg -i " + g_reroute + oldfile + " " + g_reroute + newfile + " 2>&1";
                break;
            case "video":
            	newfile += ".mp4";
                var command = "ffmpeg/ffmpeg -i " + g_reroute + oldfile + " -vcodec h264 -s 1280x720 -acodec aac " + g_reroute + newfile + " 2>&1";
                break;
            case "slide":
            	newfile += ".pdf";
            	var command = "unoconv -f pdf -o " + g_reroute + newfile + " " + g_reroute + oldfile;
            	break;
            default:
            	newfile = "error";
                var command = "";
        }

		if(newfile !== "error") {
			/* execute the command */
			child = exec(command, function (error, stdout, stderr) {
				/* delete the old uploaded file no matter what */
				removeMedia(oldfile,uid,pid);
				
				if (error !== null) {
					reject('Exec Error (createmedia) (uid:' + uid + ') (pid:' + pid + ' -> ' + stdout + stderr);
				} else {
					resolve(newfile);
				}
			});
		} else {
			reject('Bad btype provided in convertMedia()');
		}
	});

	return promise;
}

/*
	Function: deleteMedia
	
	This searches for media files in a page's folder that are not in the page's database table. If there are any, this function runs a shell command to remove those files from the folder.
	
	Parameters:
	
		uid - the user id
		pid - the page id
	
	Returns:
	
		success - number, 1
		error - number, -1
*/
function deleteMedia(connection,uid,pid) {

	/* get list of media file names in the page table */
	var promise = new Promise(function(resolve, reject) {
		
		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT mediaContent FROM p_" + uid + "_" + pid + " WHERE mediaType='image' OR mediaType='audio' OR mediaType='video' OR mediaType='slide'";

		/* query the database */
		connection.query(qry, function(err, rows, fields) {
			if(err) {
				console.log(err);
				resolve(-1);
			} else {
				var table = [];
				if(typeof rows[0] !== 'undefined') {
					var mediaCount = rows.length;
					
					/* get only the file name */
					for (var i = 0; i < mediaCount; i++) {
						table[i] = rows[i].mediaContent.replace(g_domain + g_mediaFolder + "/" + uid + "/" + pid + "/", "");
					}
					resolve(table);
				} else {
					resolve(table);
				}
			}
		});
	});

	promise.then(function(success) {
		
		if(success !== -1)
		{		
			var exec = require('child_process').exec;
			var childls;
			var childrm;
		    
		    /* set up command to find all files in the folder */
		    command = "ls " + g_reroute + g_mediaFolder + "/" + uid + "/" + pid + "/";
		
			/* execute the find files command */
			childls = exec(command, function (error, stdout, stderr) {
				if (error !== null) {
					console.log('Exec Error (deletemedia-ls): ' + error);
					return -1;
				}
				else {
					/* turn list of files into array, pop() removes empty line */
					var existing = stdout.split("\n");
					existing.pop();
					
					/* find difference between existing files & file on page table */
					var exists = false;
					var difference = existing.filter(function(existingfile) {
						exists = false;
						success.forEach(function(tablefile) {
							if (tablefile == existingfile) {
								exists = true;
							}
						})
						return !exists;
					});

					/* if there are files to be deleted, create command and remove them */				
					if (difference.length > 0) {
						command = "rm ";
						difference.forEach(function(filename) {
							command += g_reroute + g_mediaFolder + "/" + uid + "/" + pid + "/" + filename + " ";
						})
						
						childrm = exec(command, function (error, stdout, stderr) {
							if (error !== null) {
								console.log('Exec Error (deletemedia-rm): ' + error);
								return -1;
							}
							else {
								/* successful deletion */
								return 1;
							}
						});
					}
						
					/* nothing to delete */
					return 1;
				}
			});
		} else {
			/* no rows */
			return 1;
		}
	}, function(error) {
		/* promise error */
		return -1;
	});

}

/*
	Function: absentRequest
	
	This is returns a 404 type page where a user tried to access a page that could not be found in the database.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
function absentRequest(request,response) {
	// replace this with loadpage() that loads a 404 type page not found template */
	response.end('Page Not Found');
}

/*
	Section: Page Functions
	These functions are exported to the server (xample.js), page requests route to these functions.
*/
module.exports = {
	
/*
	Function: notfound
	
	Page 404, page not found response.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/		
notfound: function(request,response) {
	/* 404 page not found */
	response.status(404);
	loadPage(response,"<script>errorPage('notfound');</script>");
},

/*
	Function: start
	
	Page Index, detects if session exists and either loads landing or user's home page.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/		
start: function(request,response) {
	var __function = "start";

	/* detect is the user is logged in by checking for a session */
	if(request.session.uid) {
		/* user is logged in, display home page */
		loadPage(response,"<script>displayHome();</script>");
		journal(false,0,"",request.session.uid,__line,__function,__filename);
	} else {
		/* user is not logged in, display landing page */
		loadPage(response,"<script>displayLanding();</script>");
		journal(false,0,"",0,__line,__function,__filename);
	}
},

/*
	Function: signup
	
	Ajax, handles the sign up routine.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/		
signup: function(request,response) {
	var __function = "signup";
	
	var qs = require('querystring');
	var ps = require('password-hash');
	var fs = require('fs');

	var body = '';

    /* when the request gets data, append it to the body string */
    request.on('data', function (data) {
        body += data;
        
        /* prevent overload attacks */
	    if (body.length > 1e6) {
			request.connection.destroy();
			journal(true,199,"Overload Attack!",0,__line,__function,__filename);
		}
    });

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function(){
        pool.getConnection(function(err, connection) {
            var POST =  qs.parse(body);

            /* change info as needed */
            var hash = ps.generate(POST.password);
            
            /* get only numbers from the phone number */
            var phone = POST.phone;
            phone = phone.replace(/\D/g,'');
            
            /* escape these to prevent MySQL injection */
            var username = connection.escape(POST.username);
            var email = connection.escape(POST.email);

            /* check if username already exists */
            var promise = searchUid(connection,username);

            promise.then(function(success) {

	        	if(success !== -1) {
		            response.end('exists');
	            } else {
		        	var qryUser = "INSERT INTO Users (username, password, email, phone, autosave) VALUES (" + username + ", '"+ hash +"', " + email + ", '" + phone + "', 0)";

					/* create the user in the Users table */
					connection.query(qryUser, function(err, rows, fields) {

						if (err) {
							response.end('err');
							journal(true,201,err,0,__line,__function,__filename);
						} else {
				            var qryUid = "SELECT uid FROM Users WHERE username = " + username;

				            /* retrieve the user's new uid */
				            connection.query(qryUid, function(err, rows, fields) {
								if (err) {
									response.end('err');
									journal(true,202,err,0,__line,__function,__filename);
								} else {
									var uid = rows[0].uid;
									var qryTable = "CREATE TABLE u_" + uid + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN)";

									/* create the user's page table */
									connection.query(qryTable, function(err, rows, fields) {
										if (err) {
											response.end('err');
											journal(true,203,err,0,__line,__function,__filename);
										} else {
											/* make the user's directory to store pages in later */
											request.session.uid = uid;
											fs.mkdir(__dirname + "/../public_html/" + g_mediaFolder + "/" + uid,function(err) {
												if(err) {
													journal(true,120,err,0,__line,__function,__filename);
												}
											});
											response.end('success');
											journal(false,0,"",uid,__line,__function,__filename);
										}
									});
								}
							});
						}
					});
				}

			}, function(error) {
				response.end('err');
				journal(true,200,error,0,__line,__function,__filename);
			});
            connection.release();
        });
    });
},

/*
	Function: login
	
	Ajax, handles the log in routine.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/	
login: function(request,response) {
	var __function = "login";
	
	var qs = require('querystring');
	var ps = require('password-hash');

	var body = '';

    /* when the request gets data, append it to the body string */
    request.on('data', function (data) {
        body += data;
        
        /* prevent overload attacks */
	    if (body.length > 1e6) {
			request.connection.destroy();
			journal(true,199,"Overload Attack!",0,__line,__function,__filename);
		}
    });

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function(){
        pool.getConnection(function(err, connection) {
            var POST =  qs.parse(body);

            /* change info as needed */
            var username = connection.escape(POST.username);

            /* check if username already exists */
            var promise = searchUid(connection,username);

            promise.then(function(success) {

	        	if(success === -1) {
		            response.end('notfound');
	            } else {
		            var uid = success;

		            var qry = "SELECT password FROM Users WHERE uid = '" + uid + "'";

		            /* retrieve the user's password */
		            connection.query(qry, function(err, rows, fields) {
						if (err) {
							response.end('err');
							journal(true,201,err,0,__line,__function,__filename);
						} else {
							/* check that the entered password matches the stored password */
							if(ps.verify(POST.password,rows[0].password)) {
								/* set the user's session, this indicates logged in status */
								request.session.uid = uid;
								response.end('loggedin');
								journal(false,0,"",uid,__line,__function,__filename);
							} else {
								response.end('incorrect');
							}
						}
					});
				}
			}, function(error) {
				response.end('err');
				journal(true,200,error,0,__line,__function,__filename);
			});
            connection.release();
        });
	});
},

/*
	Function: logout
	
	Ajax, handles the log out routine.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
logout: function(request,response) {
	var __function = "logout";
	
	/* store the uid for journaling */
	var uid = request.session.uid;
	
	/* easy enough, regardless of whether the user was logged in or not, destroying the session will ensure log out */
	request.session.destroy();

	response.end('loggedout');
	journal(false,0,"",uid,__line,__function,__filename);
	uid = "";
},

/*
	Function: createpage
	
	Ajax, handles the page creation routine.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
createpage: function(request,response) {
	var __function = "createpage";
	
	var qs = require('querystring');
	var fs = require('fs');
	
	/* get the user's id */
	var uid = request.session.uid;
	
	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') { response.end('nocreateloggedout'); } else {

		var body = '';
	
	    /* when the request gets data, append it to the body string */
	    request.on('data', function (data) {
	        body += data;
	        
	        /* prevent overload attacks */
		    if (body.length > 1e6) {
				request.connection.destroy();
				journal(true,199,"Overload Attack!",0,__line,__function,__filename);
			}
	    });
	
	    /* when the request ends, parse the POST data, & process the sql queries */
	    request.on('end',function() {
	        pool.getConnection(function(err, connection) {
		        var POST =  qs.parse(body);
		        
		        /* escape the page name to prevent Sql injection */
		        var pagename = connection.escape(POST.pagename);
	
		        /* check if page name exists */
		        var promise = searchPagename(connection,uid,pagename);
	
		        promise.then(function(success) {
	
		        	if(success !== -1) {
			            response.end('pageexists');
		            } else {
				        /* insert page into user's page table */
						var qryUser = "INSERT INTO u_" + uid + " (pagename, status) VALUES (" + pagename + ", 1)";
	
					    connection.query(qryUser, function(err, rows, fields) {
					    	if (err) {
								response.end('err');
								journal(true,201,err,uid,__line,__function,__filename);
							} else {
								/* grab the pid of the new page name from the user's page table */
					            var promisePid = searchPid(connection,uid,pagename);
	
					            promisePid.then(function(success) {
						            if(success === -1) {
							            response.end('err');
							            journal(true,203,"pid not found after page insert",uid,__line,__function,__filename);
						            } else {
							            var pid = success;
	
										/* create the page's permanent table */
							            var qryPage = "CREATE TABLE p_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(1024) )";
	
							            connection.query(qryPage, function(err, rows, fields) {
											if (err) {
												response.end('err');
												journal(true,204,err,uid,__line,__function,__filename);
											}
										});
										
										/* create the page's temporary table */
										var qryTemp = "CREATE TABLE t_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(1024) )";
	
										connection.query(qryTemp, function(err, rows, fields) {
											if (err) {
												response.end('err');
												journal(true,205,err,uid,__line,__function,__filename);
											}
										});
										
										/* make a folder in user's media folder to store future media uploads */
										fs.mkdir(__dirname + "/../public_html/" + g_mediaFolder + "/" + uid + "/" + pid, function(err) {
											if(err) {
												journal(true,120,err,uid,__line,__function,__filename);
											}
										});
										response.end(pid.toString());
										journal(false,0,"",uid,__line,__function,__filename);
									}
								}, function(error) {
									response.end('err');
									journal(true,202,error,uid,__line,__function,__filename);
								});
							}
						});
					}
				}, function(error) {
					response.end('err');
					journal(true,200,error,0,__line,__function,__filename);
				});
	            connection.release();
	        });
		});
	}
},

/*
	Function: getpages
	
	Ajax, used to get a list of the user's xample pages. The data given to the http response is a comma-separate string in the following format. pid,pagename, If the user has no pages, an empty string is returned.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
getpages: function(request,response) {
	var __function = "getpages";

	/* get the user's id */
	var uid = request.session.uid;

    var qry = "SELECT pid,pagename FROM u_" + uid;

    pool.getConnection(function(err, connection) {
		connection.query(qry, function(err, rows, fields) {
			if(err) {
				response.end('err');
				journal(true,200,err,uid,__line,__function,__filename);
			} else {
				var pages = "";

				/* i is for accessing row array, j is for keeping track of rows left to parse */
				var i = 0;
				var j = rows.length;
				
				/* append commas to each row except for the last one */
				while(j > 1) {
					pages += rows[i].pid + "," + rows[i].pagename + ",";
					i++;
					j--;
				}
				if(j === 1) {
					pages += rows[i].pid + "," + rows[i].pagename;
				}

				response.end(pages);
				journal(false,0,"",uid,__line,__function,__filename);
			}
		});
        connection.release();
    });
},

/*
	Function: editpage
	
	Page Edit Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the user does not have a page with that pid, they will receive "err" in the response. If the user has no media on that page, the user will on receive the pid and pagename.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
editpage: function(request,response) {
	var __function = "editpage";
	
	/* get the user's id, getting it from the session ensures user's can edit other users pages */
	var uid = request.session.uid;
	
	/* get the pid from the get request */
	var pid = request.query.page;
	
	/* redirect users if logged out or no page id provided */
	if(typeof uid === 'undefined' || typeof pid === 'undefined') { loadPage(response,"<script>errorPage('noeditloggedout');</script>"); } else {
	
		/* get table identifier */
		var temp = request.query.temp;
		
		/* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
		var tid;
		var searchstatus;
		
		if(temp == "true") {
			tid = "t_";
			searchstatus = false;
		} else if (temp == "false") {
			tid = "p_";
			searchstatus = false;
		} else {
			tid = "p_";
			searchstatus = true;
		}
		
        pool.getConnection(function(err, connection) {
	        
	        var promise = searchPageStatus(connection,uid,pid);
	        
	        promise.then(function(success) {
		        if(searchstatus && success == 0) {
			        /* load the edit page with the page data */
					loadPage(response,"<script>choosePage('" + pid + "');</script>");
		        } else {
	        
					var qry = "SELECT pagename FROM u_" + uid + " WHERE pid=" + pid;
		
					connection.query(qry, function(err, rows, fields) {
						if(err) {
							response.end('err');
							journal(true,201,err,uid,__line,__function,__filename);
						} else {
							/* sql query is undefined if a user tries to edit page with invalid pid */
							if(typeof rows[0] === 'undefined') {
								absentRequest(request,response);
							} else {
								var pagename = rows[0].pagename;
			
								var qry = "SELECT mediaType,mediaContent FROM " + tid + uid + "_" + pid;
			
								connection.query(qry, function(err, rows, fields) {
									if(err) {
										response.end('err');
										journal(true,202,err,uid,__line,__function,__filename);
									} else {
										var pagedata = pid + ",";
										pagedata += pagename;
			
										/* i is for accessing row array, j is for keeping track of rows left to parse */
										var i = 0;
										var j = rows.length;
										
										/* append commas to each row except for the last one */
										if(j > 0)
										{
											pagedata += ",";
										}
										while(j > 1) {
											pagedata += rows[i].mediaType + "," + rows[i].mediaContent + ",";
											i++;
											j--;
										}
										if(j === 1) {
											pagedata += rows[i].mediaType + "," + rows[i].mediaContent;
										}
			
										/* load the edit page with the page data */
										loadPage(response,"<script>editPage('" + pagedata + "');</script>");
										journal(false,0,"",uid,__line,__function,__filename);
									}
								});
							}
						}
					});
					connection.release();
				}
			}, function(error) {
				response.end('err');
				journal(true,200,error,uid,__line,__function,__filename);
			});
        });
	}
},

/*
	Function: saveblocks
	
	Ajax, used to save the page content to the page table. The previous page table rows are deleted and new ones are added.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
saveblocks: function(request,response) {
	var __function = "saveblocks";
	
	var qs = require('querystring');

	/* get the user's id */
	var uid = request.session.uid;
	
	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') { response.end('nosaveloggedout'); } else {

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
            
            /* prevent overload attacks */
	        if (body.length > 1e6) {
				request.connection.destroy();
				journal(true,199,"Overload Attack!",uid,__line,__function,__filename);
			}
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err, connection) {
		        var POST =  qs.parse(body);

		        /* change info as needed */
		        var pid = POST.pid;
		        var pagename = connection.escape(POST.pagename);
		        var mediaType = POST.mediaType;
		        var mediaContent = POST.mediaContent;
		        
		        var tid;
		        var qryStatus;
		        /* 1 -> perm, 0 -> temp */
		        if (POST.tabid == 1) {
			        tid = "p_";
			        qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;
		        } else {
			        tid = "t_";
			        qryStatus = "UPDATE u_" + uid + " SET status=0 WHERE pid=" + pid;
		        }
		        
		        connection.query(qryStatus, function(err, rows, fields) {
			        if(err) {
						response.end('err');
						journal(true,200,err,uid,__line,__function,__filename);
					}
		        });

				/* get arrays of the media types and content */
		        var types = mediaType.split(',');
		        var contents = mediaContent.split(',');

				// update page name regardless of whether it was changed, this could be removed with checks later
		        var promisePage = changePagename(connection,uid,pid,pagename);

		        promisePage.then(function(success) {

			        /* truncate (remove all rows) from the table */
					var qryTruncate = "TRUNCATE TABLE " + tid + uid + "_" + pid;

					connection.query(qryTruncate, function(err, rows, fields) {
						if(err) {
							response.end('err');
							journal(true,202,err,uid,__line,__function,__filename);
						} else {

							/* check that blocks exist to be saved */
							if(types[0] !== 'undefined') {

								/* create the query and remove unused media from user's page folder as well */
								var qryInsert = "INSERT INTO " + tid + uid + "_" + pid + " (bid,mediatype,mediacontent) VALUES ";

						        var i = 0;
						        var stop = types.length - 1;

						        while(i < stop)
						        {    							        
							        qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + "),";
							        i++
						        }
						        qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + ")";

								/* save the blocks */
						        connection.query(qryInsert, function(err, rows, fields) {
									if(err) {
										response.end('err');
										journal(true,203,err,uid,__line,__function,__filename);
									} else {
										deleteMedia(connection,uid,pid);
										response.end('blockssaved');
										journal(false,0,"",uid,__line,__function,__filename);
									}
								});
							} else {
								/* in this case, just the page name was saved, since no blocks exist yet */
								response.end('blockssaved');
								journal(false,0,"",uid,__line,__function,__filename);
							}
						}
					});

		        }, function(error) {
					journal(true,201,error,uid,__line,__function,__filename);
				});
                connection.release();
            });
		});
	}
},

/*
	Function: uploadMedia
	
	Ajax, used to upload media to a user's page folder. If uploaded successfully, the user will get the absolute url to the uploaded media file.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/
uploadmedia: function(request,response) {
	var __function = "uploadmedia";
	
	var fs = require('fs');

	/* grab the user's id */
	var uid = request.session.uid;
	
	if(typeof uid === 'undefined') { response.end('nouploadloggedout'); } else {

		/* grab the pid and block type from the get query */
		var pid = request.query.pid;
		var btype = request.query.btype;

		/* pipe the incoming request to the busboy app */
		var fstream;
	    request.pipe(request.busboy);

	    request.busboy.on('file', function (fieldname, file, filename) {
	        /* set path to save the file, then pipe/save the file to that path */
	        var dir = g_mediaFolder + "/" + uid + "/" + pid + "/";
	        
	        /* replace spaces with underscores, fixes issues with shell commands */
	        var link = dir + filename.replace(/ /g,"_");
	        var fullpath = __dirname + "/../public_html/" + link;

            /* save the file, then process it */
	        fstream = fs.createWriteStream(fullpath);
	        file.pipe(fstream);
	        
	        fstream.on('close', function () {

		        /* media conversion */
		        var promise = convertMedia(link,dir,btype,uid,pid);

		        promise.then(function(success) {
			        /* respond with the absolute url to the uploaded file */
		        	response.end(g_domain + success);
		        	journal(false,0,"",uid,__line,__function,__filename);
		        }, function(error) {
			        response.end('err');
			        journal(true,110,error,uid,__line,__function,__filename);
		        });
	        });
	    });
	}
},

/*
	Function: revert
	
	Copies the temporary table to the permanent table, then sends the rows of data.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/		
revert: function(request,response) {
	var __function = "revert";
	
	var qs = require('querystring');
	
	/* grab the user's id */
	var uid = request.session.uid;
	
	if(typeof uid === 'undefined') { response.end('norevertloggedout'); } else {
		
		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
            
            /* prevent overload attacks */
	        if (body.length > 1e6) {
				request.connection.destroy();
				journal(true,199,"Overload Attack!",uid,__line,__function,__filename);
			}
        });

		request.on('end',function() {
			
			/* save the POST data */
			var POST =  qs.parse(body);
			
			if(typeof POST.pid === 'undefined') { response.end('nopid'); } else {
				var pid = POST.pid;
				
	            pool.getConnection(function(err, connection) {
									
					/* update the page status */
					var qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;
					
					connection.query(qryStatus, function(err, rows, fields) {
						if(err) {
							response.end('err');
							journal(true,200,err,uid,__line,__function,__filename);
						} else {
					
							var qryPageData = "SELECT mediaType,mediaContent FROM p_" + uid + "_" + pid;
			
							connection.query(qryPageData, function(err, rows, fields) {
								if(err) {
									response.end('err');
									journal(true,201,err,uid,__line,__function,__filename);
								} else {
									var pagedata = "";
		
									/* i is for accessing row array, j is for keeping track of rows left to parse */
									var i = 0;
									var j = rows.length;
									
									/* append commas to each row except for the last one */
									if(j > 0)
									{
										pagedata += ",";
									}
									while(j > 1) {
										pagedata += rows[i].mediaType + "," + rows[i].mediaContent + ",";
										i++;
										j--;
									}
									if(j === 1) {
										pagedata += rows[i].mediaType + "," + rows[i].mediaContent;
									}
									response.end(pagedata);
									journal(false,0,"",uid,__line,__function,__filename);
								}
							});
						}
					});
			        connection.release();
			    });
			}
		});
	}		
},

/*
	Function: profile
	
	Grabs profile information and returns it to the front-end to display the profile page.
	
	Parameters:
	
		request - http request
		response - http response
	
	Returns:
	
		nothing - *
*/		
profile: function(request,response) {
	var __function = "profile";
	
	/* grab the user's id */
	var uid = request.session.uid;
	
	if(typeof uid === 'undefined') { loadPage(response,"<script>profilePage('noprofileloggedout');</script>"); } else {
		
		var qry = "SELECT username,email,phone,autosave FROM Users WHERE uid=" + uid;

		pool.getConnection(function(err, connection) {
			connection.query(qry, function(err, rows, fields) {
				if(err) {
					loadPage(response,"<script>profilePage('err');</script>");
					journal(true,200,err,uid,__line,__function,__filename);
				} else {
					var data = {};
					
					data["username"] = rows[0].username;
					data["email"] = rows[0].email;
					data["phone"] = rows[0].phone;
					data["autosave"] = rows[0].autosave;
					
					profiledata = JSON.stringify(data);
		
					loadPage(response,"<script>profilePage('" + profiledata + "');</script>");
					journal(false,0,"",uid,__line,__function,__filename);
				}
			});
		    connection.release();
		});	
	}
},

saveprofile: function(request,response) {
	var __function = "saveprofile";
	
	var qs = require('querystring');
	var ps = require('password-hash');

	/* get the user's id */
	var uid = request.session.uid;
	
	/* if the user is not logged in, respond with 'nosaveloggedout' */
    if(typeof uid === 'undefined') { response.end('nosaveloggedout'); } else {

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
            
            /* prevent overload attacks */
	        if (body.length > 1e6) {
				request.connection.destroy();
				journal(true,199,"Overload Attack!",uid,__line,__function,__filename);
			}
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err, connection) {
		        var POST =  qs.parse(body);

		        /* profile data that requires checks should be queried here and deleted */
		        if(Object.prototype.hasOwnProperty.call(POST,'newPass')) {
			        var currentPassword = POST.currentPass;
			        var newPassword = POST.newPass;
			        
			        var qryGetPass = "SELECT password FROM Users WHERE uid=" + uid;
			        
			        connection.query(qryGetPass, function(err, rows, fields) {
						if(err) {
							console.log(err);
							response.end('err');
							journal(true,200,err,uid,__line,__function,__filename);
						} else {
							if(ps.verify(currentPassword,rows[0].password)) {
								var hash = ps.generate(newPassword);
								var qryUpdatePass = "UPDATE Users SET password='" + hash + "' WHERE uid=" + uid;

						        connection.query(qryUpdatePass, function(err, rows, fields) {
									if(err) {
										response.end('err');
										journal(true,201,err,uid,__line,__function,__filename);
									} else {
										// if only
									}
								});
							}
						}
			        });
			        
			        delete POST.currentPass;
			        delete POST.newPass;
		        }
		        
		        var keys = Object.keys(POST);
		        var count = keys.length;
		        
		        /* count could be less than one, if say, only password was being updated */
		        if(count < 1) {
			        response.end('profilesaved');
					journal(false,0,"",uid,__line,__function,__filename);
		        } else {
			        var qryArray = ["UPDATE Users SET "];
	
			        for(var i = 0; i < count; i++) {
				        var current = keys[i];
				        qryArray.push(current + "=" + connection.escape(POST[current]) + " ");
			        }
			        
			        qryArray.push("WHERE uid=" + uid);
			        var qry = qryArray.join("");
			        
			        connection.query(qry, function(err, rows, fields) {
						if(err) {
							response.end('err');
							journal(true,203,err,uid,__line,__function,__filename);
						} else {
							response.end('profilesaved');
							journal(false,0,"",uid,__line,__function,__filename);
						}
			        });
			    }
		        connection.release();
		    });
		});
	}
}

}

