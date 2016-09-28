export interface SlackMessage {
    username: string;
    icon_emoji: string;
    text: string;
}

export function slack(message) {
    const request = require("request");

    const postData: SlackMessage = {
        username: "xample-error",
        icon_emoji: ":rage:",
        // postData.channel = "#error";
        text: message
    };

    const option = {
        url: "https:///hooks.slack.com/services/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",
        body: JSON.stringify(postData)
    };

    request.post(option, function(err, res, body) {
        if (body === "ok" && !err) {
            console.log("Error Sent To Slack");
        }
    });
}

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
export function journal(isError: boolean, idNumber: number, message, userID, lineNumber, functionName, scriptName) {
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
export function loadPage(request, response, script) {

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
export function searchUid(connection, username) {
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
export function searchPagename(connection, uid, pagename) {
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
export function searchPid(connection, uid, pagename) {
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
export function searchPageStatus(connection, uid, pid) {
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
export function changePagename(connection, uid, pid, pagename) {
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
export function randomText() {

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
export function removeMedia(file, uid = 0, pid = 0) {
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
export function convertMedia(response, oldfile, dir, btype, uid = 0, pid = 0) {
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
	Function: absentRequest

	This is returns a 404 type page where a user tried to access a page that could not be found in the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
export function absentRequest(request, response) {
    /// replace this with loadpage() that loads a 404 type page not found template */
    response.end("Page Not Found");
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
export function deleteMedia(connection, uid, pid) {

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
                const table = [];
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

    promise.then(function(success: any) {
        if (success !== -1) {
            const exec = require("child_process").exec;

            /* set up command to find all files in the folder */
            let command = "ls " + GLOBALreroute + "xm/" + uid + "/" + pid + "/";

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
                    const difference = existing.filter(function(existingfile) {
                        exists = false;
                        success.forEach(function(tablefile) {
                            if (tablefile === existingfile) {
                                exists = true;
                            }
                        });
                        return !exists;
                    });

                    /* if there are files to be deleted, create command and remove them */
                    if (difference.length > 0) {
                        command = "rm ";
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
