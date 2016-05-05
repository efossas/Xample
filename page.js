/* globals for setting up the site */
var domain = "http://abaganon.com/";

/*
	Section: Set Up MySql Connection
	About: Code for getting a connection object to make mysql database queries.
*/
var mysql = require('mysql');

/* set up info for database connection */
var pool  = mysql.createPool({
  connectionLimit : 100,
  host     : 'localhost',
  user     : 'nodesql',
  password : 'Vup}Ur34',
  database : 'xample'
});

/*
	Section: Helper Functions
	About: These are functions to help provide information about the current page.
*/	

/*
	This loads the following scripts:
	vs.css <- for code block rendering
	block.css <- for styling blocks
	highlight.min.js <- for code block rendering
	MathJax.js <- for MathML & Latex rendering
	navigation.js <- xample's main js file
*/
function loadPage(response,script) {
	
	headstart = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
	codehighlightstyle = "<link rel='stylesheet' href='" + domain + "css/vs.css'>";
	blockstyle = "<link rel='stylesheet' href='" + domain + "css/block.css'>";
	pdfjs = "<script src='" + domain + "xample-scripts/pdf.js'></script>";
	codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	xamplejs = "<script src='" + domain + "xample-scripts/navigation.js'></script>";
	mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' } });</script>";
	headend = "<title>Abaganon Xample</title></head>";
	body = "<body class='xample'><div class='content' id='content'></div>";
	
	response.write(headstart + codehighlightstyle + blockstyle + pdfjs + codehighlightjs + mathjaxconfig + mathjaxjs + xamplejs + headend + body);

	response.write(script);

	response.end("</body></html>");
}

function searchUid(connection,username) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT uid FROM Users WHERE username = " + username;

		connection.query(qry, function(err, rows, fields) {
			if(err) {
				resolve(-1);
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

function searchPagename(connection,uid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pagename FROM u_" + uid + " WHERE pagename=" + pagename;

		connection.query(qry, function(err, rows, fields) {
			if(err) {
				resolve(-1);
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

function searchPid(connection,uid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT pid FROM u_" + uid + " WHERE pagename=" + pagename;

		connection.query(qry, function(err, rows, fields) {
			if(err) {
				resolve(-1);
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

function changePagename(connection,uid,pid,pagename) {
	var promise = new Promise(function(resolve, reject) {

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "UPDATE u_" + uid + " SET pagename=" + pagename + " WHERE pid=" + pid;

		connection.query(qry, function(err, rows, fields) {
			if(err) {
				resolve(-1);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
}

function truncateTable(connection,uid,pid) {
	var promise = new Promise(function(resolve, reject) {

		/* truncate (remove all rows) from the table */
		var qry = "TRUNCATE TABLE p_" + uid + "_" + pid;

		connection.query(qry, function(err, rows, fields) {
			if(err) {
				resolve(-1);
			} else {
				resolve(1);
			}
		});
	});

	return promise;
}

function randomText() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function removeMedia(file) {

		var exec = require('child_process').exec;
		var child;
        
        command = "rm " + file;

		/* execute the remove command */
		child = exec(command, function (error, stdout, stderr) {
			if (error !== null) {
				console.log('Exec Error (removemedia): ' + error);
			}
		});

}

function convertMedia(oldfile,dir,btype) {
	var promise = new Promise(function(resolve, reject) {

		var exec = require('child_process').exec;
		var child;

		/* set the new file's name */
        var reroute = "../public_html/";
		var newfile = dir + randomText();

        /* determine the ffmpeg command based on media type */
        switch(btype) {
            case "image":
            	newfile += ".jpg";
                var command = "convert " + reroute + oldfile + " -resize '1280x720>' " + reroute + newfile;
                break;
            case "audio":
            	newfile += ".mp3";
                var command = "ffmpeg/ffmpeg -i " + reroute + oldfile + " " + reroute + newfile + " 2>&1";
                break;
            case "video":
            	newfile += ".mp4";
                var command = "ffmpeg/ffmpeg -i " + reroute + oldfile + " -vcodec h264 -s 1280x720 -acodec aac " + reroute + newfile + " 2>&1";
                break;
            case "slide":
            	newfile += ".pdf";
            	var command = "unoconv -f pdf -o " + reroute + newfile + " " + reroute + oldfile;
            	break;
            default:
            	newfile = "error";
                var command = "";
        }

		/* 2>&1 sends all output stdout, so stderr will never print anything */
		child = exec(command, function (error, stdout, stderr) {
			/* delete the old uploaded file */
			removeMedia(reroute + oldfile);
			
			if (error !== null) {
				console.log('Exec Error (createmedia): ' + stdout + stderr);
				resolve(newfile);
			} else {
				resolve(newfile);
			}
		});
	});

	return promise;
}

/*
	Section: Page Functions
	About: These functions are called by specific page requests.
*/
module.exports = {
	end: function(request,response) {
		console.log('\nClean up routine complete. Xample app terminated.');
	},

	notfound: function(request,response) {
		response.end('Page Not Found');
	},

	start: function(request,response) {

		if(request.session.uid) {
			// add javascript that calls function to populate div with home page
			loadPage(response,"<script>displayHome();</script>");
		} else {
			// add javascript that calls function to populate div with landing page
			loadPage(response,"<script>displayLanding();</script>");
		}
	},

	signup: function(request,response) {
		var qs = require('querystring');
		var ps = require('password-hash');
		var fs = require('fs');

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
        });

        /* prevent overload attacks */
        if (body.length > 1e5) {
			request.connection.destroy();
			console.log('Overload Attack!');
		}

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function(){
            pool.getConnection(function(err, connection) {
                var POST =  qs.parse(body);

                /* change info as needed */
                var hash = ps.generate(POST.password);
                var phone = POST.phone;
                phone = phone.replace(/\D/g,'');
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
    							console.log("602: " + err);
    							response.end('err');
    						} else {
    				            var qryUid = "SELECT uid FROM Users WHERE username = " + username;

    				            /* retrieve the user's new uid */
    				            connection.query(qryUid, function(err, rows, fields) {
    								if (err) {
    									console.log("603: " + err);
    									response.end('err');
    								} else {
    									var uid = rows[0].uid;
    									var qryTable = "CREATE TABLE u_" + uid + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN)";

    									/* create the user's page table */
    									connection.query(qryTable, function(err, rows, fields) {
    										if (err) {
    											console.log("604: " + err);
    											response.end('err');
    										} else {
    											request.session.uid = uid;
    											fs.mkdir(__dirname + "/../public_html/xample-media/" + uid);
    											response.end('success');
    										}
    									});
    								}
    							});
    						}
    					});
    				}

    			}, function(error) {
    				console.log("605: searchUid() Promise Error");
    			});
                connection.release();
            });
        });
	},

	login: function(request,response) {
		var qs = require('querystring');
		var ps = require('password-hash');

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
        });

        /* prevent overload attacks */
        if (body.length > 1e5) {
			request.connection.destroy();
			console.log('Overload Attack!');
		}

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
    							console.log("606: " + err);
    							response.end('err');
    						} else {
    							if(ps.verify(POST.password,rows[0].password)) {
    								request.session.uid = uid;
    								response.end('loggedin');
    							} else {
    								response.end('incorrect');
    							}
    						}
    					});
    				}
    			}, function(error) {
    				console.log("607: searchUid() Promise Error");
    			});
                connection.release();
            });
		});
	},

	logout: function(request,response) {
		request.session.destroy();

		response.end('loggedout');
	},

	createpage: function(request,response) {
		var qs = require('querystring');
		var fs = require('fs');

		var body = '';

        /* when the request gets data, append it to the body string */
        request.on('data', function (data) {
            body += data;
        });

        /* prevent overload attacks */
        if (body.length > 1e5) {
			request.connection.destroy();
			console.log('Overload Attack!');
		}

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on('end',function() {
            pool.getConnection(function(err, connection) {
    	        var POST =  qs.parse(body);

    	        /* change info as needed */
    	        var uid = request.session.uid;
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
    							console.log("608: " + err);
    							response.end('err');
    						} else {
    							/* grab the pid of the new page name from the user's page table */
    				            var promisePid = searchPid(connection,uid,pagename);

    				            promisePid.then(function(success) {
    					            if(success === -1) {
    						            console.log("609: pid not found after page insert");
    						            response.end('err');
    					            } else {
    						            var pid = success;

    									/* create the page's media table */
    						            var qryPage = "CREATE TABLE p_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(1024) )";

    						            /* retrieve the user's password */
    						            connection.query(qryPage, function(err, rows, fields) {
    										if (err) {
    											console.log("610: " + err);
    											response.end('err');
    										} else {
    											fs.mkdir(__dirname + "/../public_html/xample-media/" + uid + "/" + pid);
    											response.end(pid.toString());
    										}
    									});
    								}
    							}, function(error) {
    								console.log("611: searchPid() Promise Error");
    							});
    						}
    					});
    				}
    			}, function(error) {
    				console.log("612: searchPagename() Promise Error");
    			});
                connection.release();
            });
		});
	},

	getpages: function(request,response) {

        var uid = request.session.uid;

        var qry = "SELECT pid,pagename FROM u_" + uid;

        pool.getConnection(function(err, connection) {
    		connection.query(qry, function(err, rows, fields) {
    			if(err) {
    				console.log("613: " + err);
    				response.end('err');
    			} else {
    				var pages = "";

    				var i = 0;
    				var j = rows.length;
    				while(j > 1) {
    					pages += rows[i].pid + "," + rows[i].pagename + ",";
    					i++;
    					j--;
    				}
    				if(j === 1) {
    					pages += rows[i].pid + "," + rows[i].pagename;
    				}

    				response.end(pages);
    			}
    		});
            connection.release();
        });
	},

	editpage: function(request,response) {
		var uid = request.session.uid;
		var pid = request.query.page;

		if(typeof uid === 'undefined') { response.redirect('/xample'); } else {

            pool.getConnection(function(err, connection) {
    			var qry = "SELECT pagename FROM u_" + uid + " WHERE pid=" + pid;

    			connection.query(qry, function(err, rows, fields) {
    				if(err) {
    					console.log("614: " + err);
    					response.end('err');
    				} else {
    					var pagename = rows[0].pagename;

    					var qry = "SELECT mediaType,mediaContent FROM p_" + uid + "_" + pid;

    					connection.query(qry, function(err, rows, fields) {
    						if(err) {
    						console.log("615: " + err);
    						response.end('err');
    						} else {
    							var pagedata = pid + ",";
    							pagedata += pagename;

    							var i = 0;
    							var j = rows.length;
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

    							loadPage(response,"<script>editPage('" + pagedata + "');</script>");
    						}
    					});
    				}
    			});
                connection.release();
            });
		}
	},

	saveblocks: function(request,response) {
		var qs = require('querystring');

		var uid = request.session.uid;
	    if(typeof uid === 'undefined') { response.end('err'); } else {

			var body = '';

	        /* when the request gets data, append it to the body string */
	        request.on('data', function (data) {
	            body += data;
	        });

	        /* prevent overload attacks */
	        if (body.length > 1e5) {
				request.connection.destroy();
				console.log('Overload Attack!');
			}

	        /* when the request ends, parse the POST data, & process the sql queries */
	        request.on('end',function() {
                pool.getConnection(function(err, connection) {
    		        var POST =  qs.parse(body);

    		        /* change info as needed */
    		        var pid = POST.pid;
    		        var pagename = connection.escape(POST.pagename);
    		        var mediaType = POST.mediaType;
    		        var mediaContent = POST.mediaContent;

    		        var types = mediaType.split(',');
    		        var contents = mediaContent.split(',');

    		        var promisePage = changePagename(connection,uid,pid,pagename);

    		        promisePage.then(function(success) {

    			        if(success === -1) {
    				        console.log("616: change pagename error");
    			        } else {

    				        /* truncate (remove all rows) from the table */
    						var qryTruncate = "TRUNCATE TABLE p_" + uid + "_" + pid;

    						connection.query(qryTruncate, function(err, rows, fields) {
    							if(err) {
    								console.log("617: " + err);
    								response.end('err');
    							} else {

    								if(types[0] !== 'undefined') {

    									var qryInsert = "INSERT INTO p_" + uid + "_" + pid + " (bid,mediatype,mediacontent) VALUES ";

    							        var i = 0;
    							        var stop = types.length - 1;

    							        while(i < stop)
    							        {
	    							        //
	    							        // check for type, get media file names, check folder for files that don't match, delete those extra files
	    							        //
	    							        
    								        qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + "),";
    								        i++
    							        }
    							        qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + ")";

    							        connection.query(qryInsert, function(err, rows, fields) {
    										if(err) {
    											console.log("618: " + err);
    											response.end('err');
    										} else {
    											response.end('blockssaved');
    										}
    									});
    								} else {
    									response.end('blockssaved');
    								}
    							}
    						});
    			        }

    		        }, function(error) {
    					console.log("619: changePagename() Promise Error");
    				});
                    connection.release();
                });
			});
		}
	},

	uploadmedia: function(request,response) {
		var fs = require('fs');

		var uid = request.session.uid;
		if(typeof uid === 'undefined') { response.end('err'); } else {

			var pid = request.query.pid;
			var btype = request.query.btype; // using this for ffmpeg conversion?

			/* pipe the incoming request to the busboy app */
			var fstream;
		    request.pipe(request.busboy);

		    request.busboy.on('file', function (fieldname, file, filename) {
		        /* set path to save the file, then pipe/save the file to that path */
		        var dir = "xample-media/" + uid + "/" + pid + "/";
		        
		        /* replace spaces with underscores, fixes issues with shell commands */
		        var link = dir + filename.replace(/ /g,"_");
		        var fullpath = __dirname + "/../public_html/" + link;

                /* save the file, then process it */
		        fstream = fs.createWriteStream(fullpath);
		        file.pipe(fstream);
		        
		        fstream.on('close', function () {

			        /* ffmpeg conversion */
			        var promise = convertMedia(link,dir,btype);

			        promise.then(function(success) {
			        	response.end(domain + success);
			        }, function(error) {
				        console.log("620: convertMedia() Promise Error");
			        });
		        });
		    });
		}
	}
}

