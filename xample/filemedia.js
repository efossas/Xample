/* eslint-env node, es6 */
/*
	Title: File Media
	Contains functions for editing media files on the file system.
*/

var analytics = require('./analytics.js');

/*
	Function: removeMedia

	This runs a shell command to remove a file. This is called after an uploaded media has been converted to remove the old file.

	Parameters:

		filepath - the path to the file to remove, starting with public folder
		uid - optional, user id, this is purely for debugging if something goes wrong
		did - optional, directory id, this is purely for debigging if something goes wrong

	Returns:

		success - string, 'success'
		error - string, error message
*/
function removeMedia(filepath,uid = 0,did = 0) {
	var exec = require('child_process').exec;

    /* set up the remove command */
    var command = "rm " + filepath;

	/* execute the remove command */
	exec(command,function(error,stdout,stderr) {
		if (error !== null) {
			return 'Exec Error (removemedia) (uid:' + uid + ') (did:' + did + ' -> ' + stdout + stderr;
		} else {
			return 'success';
		}
	});
}
exports.removeMedia = removeMedia;

/*
	Function: convertMedia

	This runs a shell command to convert media to html5 compatible media. Images are converted using imagemagick "convert". Audio & Video are converted using a static build of ffmpeg "ffmpeg/ffmpeg". Slides are converted using libreoffice "unoconv".

	Parameters:

		oldfile - the name of the old file that is to be converted
		absdir - the absolute path to the folder that contains the file
		reldir - the relative path to the folder that contains the file (path inside public)
		btype - the media type, "image" "audio" "video" "slide"
		uid - optional, user id, this is purely for debugging if something goes wrong
		did - optional, directory id, this is purely for debigging if something goes wrong

	Returns:

		success - promise, new file path, relative to the domain name
		error - promise, -1
*/
exports.convertMedia = function(response,oldfile,absdir,reldir,btype,uid = 0,did = 0) {
	var __function = "convertMedia";

	var helper = require("./helper.js");
	var promise = new Promise(function(resolve,reject) {

		/* spawn the process */
		var exec = require('child_process').exec;

        /* create the path to the new file & give it a random file name */
		var newfile;
		if(btype === "thumb") {
			newfile = "thumb";
		} else {
			newfile = helper.randomText();
		}

        /* create path to the old file */
        var oldfilepath = absdir + oldfile;

        /* determine the command based on media type */
        var command;
        switch(btype) {
			case "thumb":
            case "image":
                newfile += ".jpg";
                var firstpage = "";
                if(oldfile.match(/.pdf/)) {
                    firstpage = "[0]";
                }
                command = "convert -verbose -monitor " + oldfilepath + firstpage + " -resize '1280x720>' " + absdir + newfile + " 2>&1";
                break;
            case "audio":
                newfile += ".mp3";
				command = "./check.sh -f " + oldfilepath + " -o " + absdir + newfile + " -t audio";
                break;
            case "video":
                newfile += ".mp4";
				command = "./check.sh -f " + oldfilepath + " -o " + absdir + newfile + " -t video";
                break;
            case "xsvgs":
                newfile += ".svg";
                command = "mv " + oldfilepath + " " + absdir + newfile;
                break;
            case "slide":
                newfile += ".pdf";
                command = "unoconv -f pdf -o " + absdir + newfile + " " + oldfilepath;
                break;
            default:
                newfile = "error";
                command = "";
        }

		if(newfile !== "error") {
			/* execute the command */
			var child = exec(command,function(error,stdout,stderr) {
				/* delete the old uploaded file no matter what */
				var err = removeMedia(oldfilepath,uid,did);
				if(err !== "success") {
					analytics.journal(true,111,'Exec Error (removemedia) (uid:' + uid + ') (did:' + did + ' -> ' + stdout + stderr,uid,analytics.__line,__function,__filename);
				}

				if (error !== null) {
					reject('Exec Error (createmedia) (uid:' + uid + ') (did:' + did + ' -> ' + stdout + stderr);
				} else {
					resolve("," + reldir + newfile);
				}
			});

            /* this is necessary to allow browsers to continually receive responses, opposed to just one at the end */
            response.writeHead(200,{'Content-Type':'text/plain','X-Content-Type-Options':'nosniff'});

            /* handle progress responses based on media type */
            if(btype === "image") {
                var printCount = 0;
                var dataArray;
                var completion;
                var current;
                /* imagemagick prints progress in three stages */
                child.stdout.on('data',function(data) {
                    if(printCount === 0) {
                        response.write(",300");
                        printCount = 1;
                    } else if(printCount === 1) {
                        /* load progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        current = dataArray[dataArray.length - 1];
                        completion = current.slice(2,4);
                        if(current[5] === "%") {
                            response.write(",100");
                            printCount = 2;
                        } else {
                            response.write("," + completion);
                        }
                    } else if (printCount === 2) {
                        /* resize progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        if(dataArray !== null) {
                            current = dataArray[dataArray.length - 1];
                            completion = current.slice(2,4);
                            if(current[5] === "%") {
                                response.write(",200");
                                printCount = 3;
                            } else {
                                response.write("," + String(Number(completion) + 100));
                            }
                        }
                    } else if (printCount === 3) {
                        /* save progress 0-100 */
                        dataArray = data.toString().match(/, [0-9]{2,3}% com/g);
                        if(dataArray !== null) {
                            current = dataArray[dataArray.length - 1];
                            completion = current.slice(2,4);
                            if(current[5] === "%") {
                                response.write(",300");
                                printCount = 4;
                            } else {
                                response.write("," + String(Number(completion) + 200));
                            }
                        }
                    }
                });
            } else if(btype === "audio" || btype === "video") {
                child.stdout.on('data',function(data) {
					/* check for error first */
					if(data.toString().substr(0,5) === "ERROR") {
						response.write('err');
						return;
					}

                    /* search for initial value, which is media length */
                    var initial = data.toString().match(/Duration: .{11}/g);
                    if(initial !== null) {
                        var istr = initial[0];
                        var ihours = Number(istr[10] + istr[11]);
                        var iminutes = Number(istr[13] + istr[14]);
                        var iseconds = Number(istr[16] + istr[17]);

                        /* return time duration as seconds */
                        var totaltime = (ihours * 360) + (iminutes * 60) + iseconds;
                        response.write("," + String(totaltime));
                    }

                    /* search for time marker indicating position of conversion */
                    var matches = data.toString().match(/time=.{11}/g);
                    if(matches !== null) {
                        var str = matches[0];
                        var hours = Number(str[5] + str[6]);
                        var minutes = Number(str[8] + str[9]);
                        var seconds = Number(str[11] + str[12]);

                        /* return time progress as seconds */
                        var timeprogress = (hours * 360) + (minutes * 60) + seconds;
                        response.write("," + String(timeprogress));
                    }
                });
            } else if (btype === "xsvgs") {
                child.stdout.on('data',function(data) {
                    /* mv does not stdout progress, there is a hack though, check the boards */
                });
            } else if (btype === "slide") {
                child.stdout.on('data',function(data) {
                    /* unfortunately, unoconv & libreoffice don't stdout progress */
                });
            }
		} else {
			reject('Bad btype provided in convertMedia()');
		}
	});

	return promise;
};

/*
	Function: deleteMedia

	This searches for media files in a page's folder that are not in the page's database table. If there are any, this function runs a shell command to remove those files from the folder.

	Parameters:

        fileRoute - absolute path to folder where files are stored, not including xm/
		uid - the user id
		did - the directory id

	Returns:

		success - number, 1
		error - number, -1
*/
exports.deleteMedia = function(connection,fileRoute,uid,did) {
	var __function = "deleteMedia";

	var helper = require('./helper.js');

	/* get list of media file names in the page table */
	var promise = new Promise(function(resolve,reject) {

		var prefix = helper.getTablePrefixFromPageType("page");

		/* username must have connection.escape() already applied, which adds '' */
		var qry = "SELECT content FROM " + prefix + "_" + uid + "_" + did + " WHERE type='image' OR type='audio' OR type='video' OR type='xsvgs' OR type='slide'";

		/* query the database */
		connection.query(qry,function(err,rows,fields) {
			if(err) {
				analytics.journal(true,201,err,uid,analytics.__line,__function,__filename);
				resolve(-1);
			} else {
				var table = [];
				if(typeof rows[0] !== 'undefined') {
					var mediaCount = rows.length;

					/* get only the file name */
					for (var i = 0; i < mediaCount; i++) {
						var decodedLink = decodeURIComponent(rows[i].content);
						table[i] = decodedLink.replace("xm/" + uid + "/" + did + "/","");
					}
					resolve(table);
				} else {
					resolve(table);
				}
			}
		});
	});

	promise.then(function(success) {
		if(success !== -1) {
			var exec = require('child_process').exec;

            /* set up command to find all files in the folder */
            var command = "ls " + fileRoute + "xm/" + uid + "/" + did + "/";

			/* execute the find files command */
			exec(command,function(error,stdout,stderr) {
				if (error !== null) {
					analytics.journal(true,112,'Exec Error (deletemedia-ls): ' + error,uid,analytics.__line,__function,__filename);
					return -1;
				} else {
					/* turn list of files into array, pop() removes empty line */
					var existing = stdout.split("\n");
					existing.pop();

					/* find difference between existing files & file on page table */
					var exists = false;
					var difference = existing.filter(function(existingfile) {
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
							command += fileRoute + "xm/" + uid + "/" + did + "/" + filename + " ";
						});

                        /// todo: this had childrm = exec before
						exec(command,function(error,stdout,stderr) {
							if (error !== null) {
								analytics.journal(true,112,'Exec Error (deletemedia-rm): ' + error,uid,analytics.__line,__function,__filename);
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
	},function(error) {
		/* promise error */
		return -1;
	});

};
