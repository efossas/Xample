/*
	Title: Page
	This is the back-end for Xample
*/

/*
	Section: Prototypes
	These are additions or changes to js prototypes

	Object - __stack, __line, are all set using v8 engine stacktrace API functions
*/


interface InternalError extends ErrorConstructor {
    prepareStackTrace: any;
}

/* These set __line to return the current line number where they are used. They are used for logging errors.  */
declare const __stack;
Object.defineProperty(global, "__stack", {
    get: function stacker() {
        const orig = (<InternalError>Error).prepareStackTrace;
        (<InternalError>Error).prepareStackTrace = function(_, stack) { // TODO prepareStackTrace is chrome only? Not even in node?
            return stack;
        };
        let err = new Error();
        Error.captureStackTrace(err, stacker); /// was arguments.callee instead of stacker

        (<InternalError>Error).prepareStackTrace = orig;
        return err.stack;
    }
});

declare const __line;
Object.defineProperty(global, "__line", {
    get: function() {
        return __stack[1].getLineNumber();
    }
});

/*
	Section: Globals
	These are the global variables xample uses

	reroute - used to reroute paths from the server location to the public_html, the domain's base path
*/

/* reroute from server to public folder */
const GLOBALreroute = "../public_html/";

/*
	Section: MySql Connection
	Imports the MySQL module and sets up the connection pool
*/

const mysql = require("mysql");
const pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "nodesql",
    password: "Vup}Ur34",
    database: "xample"
});

const stats = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "nodesql",
    password: "Vup}Ur34",
    database: "xanalytics"
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
function journal(isError: boolean, idNumber: number, message, userID, lineNumber, functionName, scriptName) {
    const fileName = scriptName.split("/").pop();

    stats.getConnection(function(err, connection) {

        if (err) {
            console.log("FAILED JOURNAL QUERY: " + err);
        }

        let qry = "";
        if (isError) {
            qry = "INSERT INTO xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + connection.escape(message).replace(/['"`]+/g, "") + "')";
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
function loadPage(request, response, script) {

    let minified = ".min";
    if (request.root.indexOf("localhost") > 0) {
        minified = "";
    }

    /* define the library & style links here */
    let headstart = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
    let viewport = "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    let alertifycorestyle = "<link rel='stylesheet' href='" + request.root + "css/alertify.core.css'>";
    let alertifydefaultstyle = "<link rel='stylesheet' href='" + request.root + "css/alertify.default.css'>";
    let codehighlightstyle = "<link rel='stylesheet' href='" + request.root + "css/vs.css'>";
    let blockstyle = "<link rel='stylesheet' href='" + request.root + "css/block" + minified + ".css'>";
    let alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
    let pdfjs = "<script src='http://abaganon.com/js/pdf.min.js'></script>";
    let codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
    let mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
    let xamplejs = "<script src='" + request.root + "js/navigation" + minified + ".js'></script>";
    let mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";
    let headend = "<title>Abaganon Xample</title></head>";
    let body = "<body class='xample'><div id='content'></div>";

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
function searchUid(connection, username) {
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "SELECT uid FROM Users WHERE username = " + username;

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                if (typeof rows[0] !== "undefined") {
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
function searchPagename(connection, uid, pagename) {
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "SELECT pagename FROM u_" + uid + " WHERE pagename=" + pagename;

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                if (typeof rows[0] !== "undefined") {
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
function searchPid(connection, uid, pagename) {
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "SELECT pid FROM u_" + uid + " WHERE pagename=" + pagename;

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                if (typeof rows[0] !== "undefined") {
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
function searchPageStatus(connection, uid, pid) {
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "SELECT status FROM u_" + uid + " WHERE pid=" + pid;

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                if (typeof rows[0] !== "undefined") {
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
function changePagename(connection, uid, pid, pagename) {
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "UPDATE u_" + uid + " SET pagename=" + pagename + " WHERE pid=" + pid;

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
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
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    /* choose a random character and append it to "text". Do this 8 times */
    for (let i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

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
function removeMedia(file, uid = 0, pid = 0) {
    const __function = "removeMedia";

    const exec = require("child_process").exec;

    /* set up the remove command, "GLOBALreroute" is a global variable defined at the top */
    const command = "rm " + GLOBALreroute + file;

    /// todo: this had child = exec before
    /* execute the remove command */
    exec(command, function(error, stdout, stderr) {
        if (error !== null) {
            journal(true, 111, "Exec Error (removemedia) (uid:" + uid + ") (pid:" + pid + " -> " + stdout + stderr, 0, __line, __function, __filename);
            return -1;
        } else {
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
function convertMedia(response, oldfile, dir, btype, uid = 0, pid = 0) {
    const promise = new Promise(function(resolve, reject) {

        /* spawn the process */
        const exec = require("child_process").exec;

        /* create the path to the new file & give it a random file name */
        let newfile = dir + randomText();

        /* determine the command based on media type, "reroute" is a global variable defined at top */
        let command;
        switch (btype) {
            case "image":
                newfile += ".jpg";
                let firstpage = "";
                if (oldfile.match(/.pdf/)) {
                    firstpage = "[0]";
                }
                command = "convert -verbose -monitor " + GLOBALreroute + oldfile + firstpage + " -resize '1280x720>' " + GLOBALreroute + newfile + " 2>&1";
                break;
            case "audio":
                newfile += ".mp3";
                command = "ffmpeg/ffmpeg -i " + GLOBALreroute + oldfile + " " + GLOBALreroute + newfile + " 2>&1";
                break;
            case "video":
                newfile += ".mp4";
                command = "ffmpeg/ffmpeg -i " + GLOBALreroute + oldfile + " -vcodec h264 -s 1280x720 -acodec aac " + GLOBALreroute + newfile + " 2>&1";
                break;
            case "xsvgs":
                newfile += ".svg";
                command = "mv " + GLOBALreroute + oldfile + " " + GLOBALreroute + newfile;
                break;
            case "slide":
                newfile += ".pdf";
                command = "unoconv -f pdf -o " + GLOBALreroute + newfile + " " + GLOBALreroute + oldfile;
                break;
            default:
                newfile = "error";
                command = "";
        }

        if (newfile !== "error") {
            /* execute the command */
            const child = exec(command, function(error, stdout, stderr) {

                /* delete the old uploaded file no matter what */
                removeMedia(oldfile, uid, pid);

                if (error !== null) {
                    reject("Exec Error (createmedia) (uid:" + uid + ") (pid:" + pid + " -> " + stdout + stderr);
                } else {
                    resolve("," + newfile);
                }
            });

            /* this is necessary to allow browsers to continually receive responses, opposed to just one at the end */
            response.writeHead(200, { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" });

            /* handle progress responses based on media type */
            if (btype === "image") {
                let printCount = 0;
                let dataArray;
                let completion;
                let current;
                /* imagemagick prints progress in three stages */
                child.stdout.on("data", function(data) {
                    if (printCount === 0) {
                        response.write(",300");
                        printCount = 1;
                    } else if (printCount === 1) {
                        /* load progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        current = dataArray[dataArray.length - 1];
                        completion = current.slice(2, 4);
                        if (current[5] === "%") {
                            response.write(",100");
                            printCount = 2;
                        } else {
                            response.write("," + completion);
                        }
                    } else if (printCount === 2) {
                        /* resize progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        if (dataArray !== null) {
                            current = dataArray[dataArray.length - 1];
                            completion = current.slice(2, 4);
                            if (current[5] === "%") {
                                response.write(",200");
                                printCount = 3;
                            } else {
                                response.write("," + String(Number(completion) + 100));
                            }
                        }
                    } else if (printCount === 3) {
                        /* save progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        if (dataArray !== null) {
                            current = dataArray[dataArray.length - 1];
                            completion = current.slice(2, 4);
                            if (current[5] === "%") {
                                response.write(",300");
                                printCount = 4;
                            } else {
                                response.write("," + String(Number(completion) + 200));
                            }
                        }
                    }
                });
            } else if (btype === "audio" || btype === "video") {
                child.stdout.on("data", function(data) {
                    /* search for initial value, which is media length */
                    const initial = data.toString().match(/Duration: .{11}/g);
                    if (initial !== null) {
                        const istr = initial[0];
                        const ihours = Number(istr[10] + istr[11]);
                        const iminutes = Number(istr[13] + istr[14]);
                        const iseconds = Number(istr[16] + istr[17]);

                        /* return time duration as seconds */
                        const totaltime = (ihours * 360) + (iminutes * 60) + iseconds;
                        response.write("," + String(totaltime));
                    }

                    /* search for time marker indicating position of conversion */
                    const matches = data.toString().match(/time=.{11}/g);
                    if (matches !== null) {
                        const str = matches[0];
                        const hours = Number(str[5] + str[6]);
                        const minutes = Number(str[8] + str[9]);
                        const seconds = Number(str[11] + str[12]);

                        /* return time progress as seconds */
                        const timeprogress = (hours * 360) + (minutes * 60) + seconds;
                        response.write("," + String(timeprogress));
                    }
                });
            } else if (btype === "xsvgs") {
                child.stdout.on("data", function(data) {
                    /* mv does not stdout progress, there is a hack though, check the boards */
                });
            } else if (btype === "slide") {
                child.stdout.on("data", function(data) {
                    /* unfortunately, unoconv & libreoffice don't stdout progress */
                });
            }
        } else {
            reject("Bad btype provided in convertMedia()");
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
function deleteMedia(connection, uid, pid) {

    /* get list of media file names in the page table */
    const promise = new Promise(function(resolve, reject) {

        /* username must have connection.escape() already applied, which adds '' */
        const qry = "SELECT mediaContent FROM p_" + uid + "_" + pid + " WHERE mediaType='image' OR mediaType='audio' OR mediaType='video' OR mediaType='xsvgs' OR mediaType='slide'";

        /* query the database */
        connection.query(qry, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(-1);
            } else {
                let table = [];
                if (typeof rows[0] !== "undefined") {
                    const mediaCount = rows.length;

                    /* get only the file name */
                    for (let i = 0; i < mediaCount; i++) {
                        table[i] = rows[i].mediaContent.replace("xm/" + uid + "/" + pid + "/", "");
                    }
                    resolve(table);
                } else {
                    resolve(table);
                }
            }
        });
    });

    promise.then(function(success) {

        if (success !== -1) {
            const exec = require("child_process").exec;

            /* set up command to find all files in the folder */
            const command = "ls " + GLOBALreroute + "xm/" + uid + "/" + pid + "/";

            /* execute the find files command */
            exec(command, function(error, stdout, stderr) {
                if (error !== null) {
                    console.log("Exec Error (deletemedia-ls): " + error);
                    return -1;
                } else {
                    /* turn list of files into array, pop() removes empty line */
                    const existing = stdout.split("\n");
                    existing.pop();

                    /* find difference between existing files & file on page table */
                    let exists = false;
                    let difference = existing.filter(function(existingfile) {
                        exists = false;
                        (<Array<any>> success).forEach(function(tablefile) {
                            if (tablefile === existingfile) {
                                exists = true;
                            }
                        });
                        return !exists;
                    });

                    /* if there are files to be deleted, create command and remove them */
                    if (difference.length > 0) {
                        let command = "rm ";
                        difference.forEach(function(filename) {
                            command += GLOBALreroute + "xm/" + uid + "/" + pid + "/" + filename + " ";
                        });

                        /// todo: this had childrm = exec before
                        exec(command, function(error, stdout, stderr) {
                            if (error !== null) {
                                console.log("Exec Error (deletemedia-rm): " + error);
                                return -1;
                            } else {
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
function absentRequest(request, response) {
    /// replace this with loadpage() that loads a 404 type page not found template */
    response.end("Page Not Found");
}

// <<<fold>>>

/*
	Section: Page Functions
	These functions are exported to the server (xample.js), page requests route to these functions.
*/

// <<<code>>>

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
    notfound: function(request, response) {
        /* 404 page not found */
        response.status(404);
        loadPage(request, response, "<script>pageError('notfound');</script>");
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
    start: function(request, response) {
        const __function = "start";

        /* detect is the user is logged in by checking for a session */
        if (request.session.uid) {
            /* user is logged in, display home page */
            loadPage(request, response, "<script>pageHome();</script>");
            journal(false, 0, "", request.session.uid, __line, __function, __filename);
        } else {
            /* user is not logged in, display landing page */
            loadPage(request, response, "<script>pageLanding();</script>");
            journal(false, 0, "", 0, __line, __function, __filename);
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
    signup: function(request, response) {
        const __function = "signup";

        const qs = require("querystring");
        const ps = require("password-hash");
        const fs = require("fs");

        let body = "";

        /* when the request gets data, append it to the body string */
        request.on("data", function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
                request.connection.destroy();
                journal(true, 199, "Overload Attack!", 0, __line, __function, __filename);
            }
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on("end", function() {
            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, 0, __line, __function, __filename);
                }

                const POST = qs.parse(body);

                /* change info as needed */
                const hash = ps.generate(POST.password);

                /* get only numbers from the phone number */
                const phone = POST.phone.replace(/\D/g, "");

                /* escape these to prevent MySQL injection */
                const username = connection.escape(POST.username);
                const email = connection.escape(POST.email);

                /* check if username already exists */
                const promise = searchUid(connection, username);

                promise.then(function(success) {

                    if (success !== -1) {
                        response.end("exists");
                    } else {
                        const qryUser = "INSERT INTO Users (username,password,email,phone,autosave,defaulttext) VALUES (" + username + ",'" + hash + "'," + email + ",'" + phone + "',0,1)";

                        /* create the user in the Users table */
                        connection.query(qryUser, function(err, rows, fields) {

                            if (err) {
                                response.end("err");
                                journal(true, 201, err, 0, __line, __function, __filename);
                            } else {
                                const qryUid = "SELECT uid FROM Users WHERE username = " + username;

                                /* retrieve the user's new uid */
                                connection.query(qryUid, function(err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        journal(true, 202, err, 0, __line, __function, __filename);
                                    } else {
                                        const uid = rows[0].uid;
                                        const qryTable = "CREATE TABLE u_" + uid + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32))";

                                        /* create the user's page table */
                                        connection.query(qryTable, function(err, rows, fields) {
                                            if (err) {
                                                response.end("err");
                                                journal(true, 203, err, 0, __line, __function, __filename);
                                            } else {
                                                /* make the user's directory to store pages in later */
                                                request.session.uid = uid;
                                                fs.mkdir(__dirname + "/" + GLOBALreroute + "xm/" + uid, function(err) {
                                                    if (err) {
                                                        journal(true, 120, err, 0, __line, __function, __filename);
                                                    }
                                                });
                                                response.end("success");
                                                journal(false, 0, "", uid, __line, __function, __filename);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }

                }, function(error) {
                    response.end("err");
                    journal(true, 200, error, 0, __line, __function, __filename);
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
    login: function(request, response) {
        const __function = "login";

        const qs = require("querystring");
        const ps = require("password-hash");

        let body = "";

        /* when the request gets data, append it to the body string */
        request.on("data", function(data) {
            body += data;

            /* prevent overload attacks */
            if (body.length > 1e6) {
                request.connection.destroy();
                journal(true, 199, "Overload Attack!", 0, __line, __function, __filename);
            }
        });

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on("end", function() {
            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, 0, __line, __function, __filename);
                }

                const POST = qs.parse(body);

                /* change info as needed */
                const username = connection.escape(POST.username);

                /* check if username already exists */
                const promise = searchUid(connection, username);

                promise.then(function(success) {

                    if (success === -1) {
                        response.end("notfound");
                    } else {
                        const uid = success;

                        const qry = "SELECT password FROM Users WHERE uid = '" + uid + "'";

                        /* retrieve the user's password */
                        connection.query(qry, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 201, err, 0, __line, __function, __filename);
                            } else {
                                /* check that the entered password matches the stored password */
                                if (ps.verify(POST.password, rows[0].password)) {
                                    /* set the user's session, this indicates logged in status */
                                    request.session.uid = uid;
                                    response.end("loggedin");
                                    journal(false, 0, "", uid, __line, __function, __filename);
                                } else {
                                    response.end("incorrect");
                                }
                            }
                        });
                    }
                }, function(error) {
                    response.end("err");
                    journal(true, 200, error, 0, __line, __function, __filename);
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
    logout: function(request, response) {
        const __function = "logout";

        /* store the uid for journaling */
        let uid = request.session.uid;

        /* easy enough, regardless of whether the user was logged in or not, destroying the session will ensure log out */
        request.session.destroy();

        response.end("loggedout");
        journal(false, 0, "", uid, __line, __function, __filename);
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
    createpage: function(request, response) {
        const __function = "createpage";

        const qs = require("querystring");
        const fs = require("fs");

        /* get the user's id */
        const uid = request.session.uid;

        /* if the user is not logged in, respond with 'nosaveloggedout' */
        if (typeof uid === "undefined") {
            response.end("nocreateloggedout");
        } else {

            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", 0, __line, __function, __filename);
                }
            });

            /* when the request ends, parse the POST data, & process the sql queries */
            request.on("end", function() {
                pool.getConnection(function(err, connection) {
                    if (err) {
                        journal(true, 221, err, uid, __line, __function, __filename);
                    }

                    const POST = qs.parse(body);

                    /* escape the page name to prevent Sql injection */
                    const pagename = connection.escape(POST.pagename);
                    const subject = connection.escape(POST.subject);
                    const category = connection.escape(POST.category);
                    const topic = connection.escape(POST.topic);

                    /* check if page name exists */
                    const promise = searchPagename(connection, uid, pagename);

                    promise.then(function(success) {

                        if (success !== -1) {
                            response.end("pageexists");
                        } else {
                            /* insert page into user's page table */
                            const qryUser = "INSERT INTO u_" + uid + " (pagename,status,subject,category,topic) VALUES (" + pagename + ",1," + subject + "," + category + "," + topic + ")";

                            connection.query(qryUser, function(err, rows, fields) {
                                if (err) {
                                    response.end("err");
                                    journal(true, 201, err, uid, __line, __function, __filename);
                                } else {
                                    /* grab the pid of the new page name from the user's page table */
                                    const promisePid = searchPid(connection, uid, pagename);

                                    promisePid.then(function(success) {
                                        if (success === -1) {
                                            response.end("err");
                                            journal(true, 203, "pid not found after page insert", uid, __line, __function, __filename);
                                        } else {
                                            const pid = success;

                                            /* create the page's permanent table */
                                            const qryPage = "CREATE TABLE p_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";

                                            connection.query(qryPage, function(err, rows, fields) {
                                                if (err) {
                                                    response.end("err");
                                                    journal(true, 204, err, uid, __line, __function, __filename);
                                                }
                                            });

                                            /* create the page's temporary table */
                                            const qryTemp = "CREATE TABLE t_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";

                                            connection.query(qryTemp, function(err, rows, fields) {
                                                if (err) {
                                                    response.end("err");
                                                    journal(true, 205, err, uid, __line, __function, __filename);
                                                }
                                            });

                                            /* make a folder in user's media folder to store future media uploads */
                                            fs.mkdir(__dirname + "/" + GLOBALreroute + "xm/" + uid + "/" + pid, function(err) {
                                                if (err) {
                                                    journal(true, 120, err, uid, __line, __function, __filename);
                                                }
                                            });
                                            response.end(pid.toString());
                                            journal(false, 0, "", uid, __line, __function, __filename);
                                        }
                                    }, function(error) {
                                        response.end("err");
                                        journal(true, 202, error, uid, __line, __function, __filename);
                                    });
                                }
                            });
                        }
                    }, function(error) {
                        response.end("err");
                        journal(true, 200, error, 0, __line, __function, __filename);
                    });
                    connection.release();
                });
            });
        }
    },

    /*
        Function: deletepage

        Ajax, handles the page deletion routine.

        Parameters:

            request - http request
            response - http response

        Returns:

            nothing - *
    */
    deletepage: function(request, response) {
        const __function = "deletepage";

        const qs = require("querystring");

        /* get the user's id */
        const uid = request.session.uid;

        /* if the user is not logged in, respond with 'nosaveloggedout' */
        if (typeof uid === "undefined") {
            response.end("nodeleteloggedout");
        } else {
            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
                }
            });

            /* when the request ends,parse the POST data, & process the sql queries */
            request.on("end", function() {
                pool.getConnection(function(err, connection) {
                    if (err) {
                        journal(true, 221, err, uid, __line, __function, __filename);
                        response.end("err");
                    } else {
                        const POST = qs.parse(body);

                        /* change info as needed */
                        const pid = connection.escape(POST.pid).replace(/'/g, "");

                        const qryDeleteRow = "DELETE FROM u_" + uid + " WHERE pid=" + pid;
                        const qryDeletePermPage = "DROP TABLE p_" + uid + "_" + pid;
                        const qryDeleteTempPage = "DROP TABLE t_" + uid + "_" + pid;

                        /* three async queries, use this flag for knowning when to send response */
                        let firstQryComplete = false;
                        let secondQryComplete = false;

                        /* delete page row from user's page list */
                        connection.query(qryDeleteRow, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 200, err, uid, __line, __function, __filename);
                            } else {
                                if (firstQryComplete && secondQryComplete) {
                                    response.end("success");
                                    journal(false, 0, "", uid, __line, __function, __filename);
                                } else if (firstQryComplete) {
                                    secondQryComplete = true;
                                } else {
                                    firstQryComplete = true;
                                }
                            }
                        });

                        /* delete the permanent page table */
                        connection.query(qryDeletePermPage, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 200, err, uid, __line, __function, __filename);
                            } else {
                                if (firstQryComplete && secondQryComplete) {
                                    response.end("success");
                                    journal(false, 0, "", uid, __line, __function, __filename);
                                } else if (firstQryComplete) {
                                    secondQryComplete = true;
                                } else {
                                    firstQryComplete = true;
                                }
                            }
                        });

                        /* delete the temporary page */
                        connection.query(qryDeleteTempPage, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 200, err, uid, __line, __function, __filename);
                            } else {
                                if (firstQryComplete && secondQryComplete) {
                                    response.end("success");
                                    journal(false, 0, "", uid, __line, __function, __filename);
                                } else if (firstQryComplete) {
                                    secondQryComplete = true;
                                } else {
                                    firstQryComplete = true;
                                }
                            }
                        });
                        connection.release();
                    }
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
    getpages: function(request, response) {
        const __function = "getpages";

        /* get the user's id */
        const uid = request.session.uid;

        const qry = "SELECT pid,pagename FROM u_" + uid;

        pool.getConnection(function(err, connection) {
            if (err) {
                journal(true, 221, err, uid, __line, __function, __filename);
            }

            connection.query(qry, function(err, rows, fields) {
                if (err) {
                    response.end("err");
                    journal(true, 200, err, uid, __line, __function, __filename);
                } else {
                    let pages = "";

                    /* i is for accessing row array, j is for keeping track of rows left to parse */
                    let i = 0;
                    let j = rows.length;

                    /* append commas to each row except for the last one */
                    while (j > 1) {
                        pages += rows[i].pid + "," + rows[i].pagename + ",";
                        i++;
                        j--;
                    }
                    if (j === 1) {
                        pages += rows[i].pid + "," + rows[i].pagename;
                    }

                    response.end(pages);
                    journal(false, 0, "", uid, __line, __function, __filename);
                }
            });
            connection.release();
        });
    },

    getsubjects: function(request, response) {
        const __function = "getsubjects";

        const fs = require("fs");

        /* get the user's id */
        const uid = request.session.uid;

        /* get the topics from the local json file */
        fs.readFile("data/topics.json", function(err, data) {
            if (err) {
                response.end("err");
                journal(true, 120, err, uid, __line, __function, __filename);
            } else {
                response.end(data.toString());
            }
        });
    },

    /*
        Function: editpage

        Page Edit Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the user does not have a page with that pid, they will receive "err" in the response. If the user has no media on that page, the user will only receive the pid and pagename.

        Parameters:

            request - http request
            response - http response

        Returns:

            nothing - *
    */
    editpage: function(request, response) {
        const __function = "editpage";

        /* get the user's id, getting it from the session ensures user's can edit other users pages */
        const uid = request.session.uid;

        /* get the pid from the get request */
        const pid = request.query.page;

        /* redirect users if logged out or no page id provided */
        if (typeof uid === "undefined" || typeof pid === "undefined") {
            loadPage(request, response, "<script>pageError('noeditloggedout');</script>");
        } else {

            /* get table identifier */
            const temp = request.query.temp;

            /* if searchstatus is set to false, don't bother with page status, user is coming from choose page */
            let tid;
            let searchstatus;

            if (temp === "true") {
                tid = "t_";
                searchstatus = false;
            } else if (temp === "false") {
                tid = "p_";
                searchstatus = false;
            } else {
                tid = "p_";
                searchstatus = true;
            }

            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, uid, __line, __function, __filename);
                }

                const promise = searchPageStatus(connection, uid, pid);

                promise.then(function(success) {
                    if (searchstatus && success == 0) {
                        /* load the edit page with the page data */
                        loadPage(request, response, "<script>pageChoose('" + pid + "');</script>");
                    } else {

                        const qry = "SELECT pagename FROM u_" + uid + " WHERE pid=" + pid;

                        connection.query(qry, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 201, err, uid, __line, __function, __filename);
                            } else {
                                /* sql query is undefined if a user tries to edit page with invalid pid */
                                if (typeof rows[0] === "undefined") {
                                    absentRequest(request, response);
                                } else {
                                    const pagename = rows[0].pagename;

                                    const qry = "SELECT mediaType,mediaContent FROM " + tid + uid + "_" + pid;

                                    connection.query(qry, function(err, rows, fields) {
                                        if (err) {
                                            response.end("err");
                                            journal(true, 202, err, uid, __line, __function, __filename);
                                        } else {
                                            let pagedata = pid + "," + pagename;

                                            /* i is for accessing row array, j is for keeping track of rows left to parse */
                                            let i = 0;
                                            let j = rows.length;

                                            /* append commas to each row except for the last one */
                                            if (j > 0) {
                                                pagedata += ",";
                                            }
                                            while (j > 1) {
                                                pagedata += rows[i].mediaType + "," + rows[i].mediaContent + ",";
                                                i++;
                                                j--;
                                            }
                                            if (j === 1) {
                                                pagedata += rows[i].mediaType + "," + rows[i].mediaContent;
                                            }

                                            /* load the edit page with the page data */
                                            loadPage(request, response, "<script>pageEdit('" + pagedata + "');</script>");
                                            journal(false, 0, "", uid, __line, __function, __filename);
                                        }
                                    });
                                }
                            }
                        });
                        connection.release();
                    }
                }, function(error) {
                    response.end("err");
                    journal(true, 200, error, uid, __line, __function, __filename);
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
    saveblocks: function(request, response) {
        const __function = "saveblocks";

        const qs = require("querystring");

        /* get the user's id */
        const uid = request.session.uid;

        /* if the user is not logged in, respond with 'nosaveloggedout' */
        if (typeof uid === "undefined") {
            response.end("nosaveloggedout");
        } else {

            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
                }
            });

            /* when the request ends,parse the POST data, & process the sql queries */
            request.on("end", function() {
                pool.getConnection(function(err, connection) {
                    if (err) {
                        journal(true, 221, err, uid, __line, __function, __filename);
                    }

                    const POST = qs.parse(body);

                    /* change info as needed */
                    const pid = POST.pid;
                    const pagename = connection.escape(POST.pagename);
                    const mediaType = POST.mediaType;
                    const mediaContent = POST.mediaContent;

                    let tid;
                    let qryStatus;
                    /* 1 -> perm, 0 -> temp */
                    if (POST.tabid == 1) {
                        tid = "p_";
                        qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;
                    } else {
                        tid = "t_";
                        qryStatus = "UPDATE u_" + uid + " SET status=0 WHERE pid=" + pid;
                    }

                    connection.query(qryStatus, function(err, rows, fields) {
                        if (err) {
                            response.end("err");
                            journal(true, 200, err, uid, __line, __function, __filename);
                        }
                    });

                    /* get arrays of the media types and content */
                    const types = mediaType.split(",");
                    const contents = mediaContent.split(",");

                    /// update page name regardless of whether it was changed, this could be removed with checks later
                    const promisePage = changePagename(connection, uid, pid, pagename);

                    promisePage.then(function(success) {

                        /* truncate (remove all rows) from the table */
                        const qryTruncate = "TRUNCATE TABLE " + tid + uid + "_" + pid;

                        connection.query(qryTruncate, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 202, err, uid, __line, __function, __filename);
                            } else {

                                /* check that blocks exist to be saved */
                                if (types[0] !== "undefined") {

                                    /* create the query and remove unused media from user's page folder as well */
                                    let qryInsert = "INSERT INTO " + tid + uid + "_" + pid + " (bid,mediatype,mediacontent) VALUES ";

                                    let i = 0;
                                    const stop = types.length - 1;

                                    while (i < stop) {
                                        qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + "),";
                                        i++;
                                    }
                                    qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + ")";

                                    /* save the blocks */
                                    connection.query(qryInsert, function(err, rows, fields) {
                                        if (err) {
                                            response.end("err");
                                            journal(true, 203, err, uid, __line, __function, __filename);
                                        } else {
                                            /* only delete unused files on permanent table saves */
                                            if (POST.tabid == 1) {
                                                deleteMedia(connection, uid, pid);
                                            }
                                            response.end("blockssaved");
                                            journal(false, 0, "", uid, __line, __function, __filename);
                                        }
                                    });
                                } else {
                                    /* in this case, only page save, since no blocks */
                                    response.end("blockssaved");
                                    /* there could have been blocks deleted though, so delete if perm save */
                                    if (POST.tabid == 1) {
                                        deleteMedia(connection, uid, pid);
                                    }
                                    journal(false, 0, "", uid, __line, __function, __filename);
                                }
                            }
                        });

                    }, function(error) {
                        journal(true, 201, error, uid, __line, __function, __filename);
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
    uploadmedia: function(request, response) {
        const __function = "uploadmedia";

        const fs = require("fs");

        /* grab the user's id */
        const uid = request.session.uid;

        if (typeof uid === "undefined") {
            response.end("nouploadloggedout");
        } else {

            /* grab the pid and block type from the get query */
            const pid = request.query.pid;
            const btype = request.query.btype;

            /* pipe the incoming request to the busboy app */
            let fstream;
            request.pipe(request.busboy);

            request.busboy.on("file", function(fieldname, file, filename) {
                /* set path to save the file, then pipe/save the file to that path */
                const dir = "xm/" + uid + "/" + pid + "/";

                /* replace spaces with underscores, fixes issues with shell commands */
                const link = dir + filename.replace(/ /g, "_");
                const fullpath = __dirname + "/../public_html/" + link;

                /* save the file, then process it */
                fstream = fs.createWriteStream(fullpath);
                file.pipe(fstream);

                fstream.on("close", function() {
                    /* media conversion */
                    const promise = convertMedia(response, link, dir, btype, uid, pid);

                    promise.then(function(success) {
                        /* respond with the absolute url to the uploaded file */
                        response.end(request.root + success);
                        journal(false, 0, "", uid, __line, __function, __filename);
                    }, function(error) {
                        response.end("convertmediaerr");
                        /// remove bad media
                        journal(true, 110, error, uid, __line, __function, __filename);
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
    revert: function(request, response) {
        const __function = "revert";

        const qs = require("querystring");

        /* grab the user's id */
        const uid = request.session.uid;

        if (typeof uid === "undefined") {
            response.end("norevertloggedout");
        } else {

            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
                }
            });

            request.on("end", function() {

                /* save the POST data */
                const POST = qs.parse(body);

                if (typeof POST.pid === "undefined") {
                    response.end("nopid");
                } else {
                    const pid = POST.pid;

                    pool.getConnection(function(err, connection) {
                        if (err) {
                            journal(true, 221, err, uid, __line, __function, __filename);
                        }

                        /* update the page status */
                        const qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;

                        connection.query(qryStatus, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 200, err, uid, __line, __function, __filename);
                            } else {

                                const qryPageData = "SELECT mediaType,mediaContent FROM p_" + uid + "_" + pid;

                                connection.query(qryPageData, function(err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        journal(true, 201, err, uid, __line, __function, __filename);
                                    } else {
                                        let pagedata = "";

                                        /* i is for accessing row array, j is for keeping track of rows left to parse */
                                        let i = 0;
                                        let j = rows.length;

                                        /* append commas to each row except for the last one */
                                        if (j > 0) {
                                            pagedata += ",";
                                        }
                                        while (j > 1) {
                                            pagedata += rows[i].mediaType + "," + rows[i].mediaContent + ",";
                                            i++;
                                            j--;
                                        }
                                        if (j === 1) {
                                            pagedata += rows[i].mediaType + "," + rows[i].mediaContent;
                                        }
                                        response.end(pagedata);
                                        journal(false, 0, "", uid, __line, __function, __filename);
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
    profile: function(request, response) {
        const __function = "profile";

        /* grab the user's id */
        const uid = request.session.uid;

        if (typeof uid === "undefined") {
            loadPage(request, response, "<script>pageProfile('noprofileloggedout');</script>");
        } else {

            const qry = "SELECT username,email,phone,autosave,defaulttext FROM Users WHERE uid=" + uid;

            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, uid, __line, __function, __filename);
                }

                connection.query(qry, function(err, rows, fields) {
                    if (err) {
                        loadPage(request, response, "<script>pageProfile('err');</script>");
                        journal(true, 200, err, uid, __line, __function, __filename);
                    } else {
                        const data = {};

                        data["username"] = rows[0].username;
                        data["email"] = rows[0].email;
                        data["phone"] = rows[0].phone;
                        data["autosave"] = rows[0].autosave;
                        data["defaulttext"] = rows[0].defaulttext;

                        const profiledata = JSON.stringify(data);

                        loadPage(request, response, "<script>pageProfile('" + profiledata + "');</script>");
                        journal(false, 0, "", uid, __line, __function, __filename);
                    }
                });
                connection.release();
            });
        }
    },

    /*
        Function: saveprofile

        Saves profile data to the database.

        Parameters:

            request - http request
            response - http response

        Returns:

            nothing - *
    */
    saveprofile: function(request, response) {
        const __function = "saveprofile";

        const qs = require("querystring");
        const ps = require("password-hash");

        /* get the user's id */
        const uid = request.session.uid;

        /* if the user is not logged in, respond with 'nosaveloggedout' */
        if (typeof uid === "undefined") {
            response.end("nosaveloggedout");
        } else {

            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
                }
            });

            /* when the request ends, parse the POST data, & process the sql queries */
            request.on("end", function() {
                pool.getConnection(function(err, connection) {
                    if (err) {
                        journal(true, 221, err, uid, __line, __function, __filename);
                    }

                    const POST = qs.parse(body);

                    /* profile data that requires checks should be queried here and deleted */
                    if (Object.prototype.hasOwnProperty.call(POST, "newPass")) {
                        const currentPassword = POST.currentPass;
                        const newPassword = POST.newPass;

                        const qryGetPass = "SELECT password FROM Users WHERE uid=" + uid;

                        connection.query(qryGetPass, function(err, rows, fields) {
                            if (err) {
                                console.log(err);
                                response.end("err");
                                journal(true, 200, err, uid, __line, __function, __filename);
                            } else {
                                if (ps.verify(currentPassword, rows[0].password)) {
                                    const hash = ps.generate(newPassword);
                                    const qryUpdatePass = "UPDATE Users SET password='" + hash + "' WHERE uid=" + uid;

                                    connection.query(qryUpdatePass, function(err, rows, fields) {
                                        if (err) {
                                            response.end("err");
                                            journal(true, 201, err, uid, __line, __function, __filename);
                                        } else {
                                            /// if only
                                        }
                                    });
                                }
                            }
                        });

                        delete POST.currentPass;
                        delete POST.newPass;
                    }

                    const keys = Object.keys(POST);
                    const count = keys.length;

                    /* count could be less than one, if say, only password was being updated */
                    if (count < 1) {
                        response.end("profilesaved");
                        journal(false, 0, "", uid, __line, __function, __filename);
                    } else {
                        const qryArray = ["UPDATE Users SET "];

                        for (let i = 0; i < count; i++) {
                            const current = keys[i];
                            qryArray.push(current + "=" + connection.escape(POST[current]) + " ");
                        }

                        qryArray.push("WHERE uid=" + uid);
                        const qry = qryArray.join("");

                        connection.query(qry, function(err, rows, fields) {
                            if (err) {
                                response.end("err");
                                journal(true, 203, err, uid, __line, __function, __filename);
                            } else {
                                response.end("profilesaved");
                                journal(false, 0, "", uid, __line, __function, __filename);
                            }
                        });
                    }
                    connection.release();
                });
            });
        }
    },

    /*
        Function: getprofiledata

        Grabs profile information and returns it.

        Parameters:

            request - http request
            response - http response

        Returns:

            nothing - *
    */
    getprofiledata: function(request, response) {
        const __function = "getprofiledata";

        const qs = require("querystring");

        /* grab the user's id */
        const uid = request.session.uid;

        if (typeof uid === "undefined") {
            response.end("noprofiledataloggedout");
        } else {

            let body = "";

            /* when the request gets data, append it to the body string */
            request.on("data", function(data) {
                body += data;

                /* prevent overload attacks */
                if (body.length > 1e6) {
                    request.connection.destroy();
                    journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
                }
            });

            /* when the request ends, parse the POST data, & process the sql queries */
            request.on("end", function() {

                const POST = qs.parse(body);

                const qry = "SELECT " + POST.fields + " FROM Users WHERE uid=" + uid;

                pool.getConnection(function(err, connection) {
                    if (err) {
                        journal(true, 221, err, uid, __line, __function, __filename);
                    }

                    connection.query(qry, function(err, rows, fields) {
                        if (err) {
                            response.end("err");
                            journal(true, 200, err, uid, __line, __function, __filename);
                        } else {
                            const profiledata = JSON.stringify(rows[0]);

                            response.end(profiledata);
                            journal(false, 0, "", uid, __line, __function, __filename);
                        }
                    });
                    connection.release();
                });
            });
        }
    }
};