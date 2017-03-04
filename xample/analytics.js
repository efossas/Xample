/* eslint-env node, es6 */
/* eslint no-console: "off" */

/*
	Title: Stats
	This contains a function for journaling analytics.
*/

/* create a pool of db connections */
var mysql = require('mysql');

var stats = mysql.createPool({
  connectionLimit : 100,
  host     : 'localhost',
  user     : 'nodesql',
  password : 'Vup}Ur34',
  database : 'xanalytics'
});

/* immediately test a connection, if this fails, print to console */
stats.getConnection(function(error,connection) {
    if(error) {
        console.log('analytics db connection error: ' + error);
        console.log(' ');
        connection.release();
        process.send({code:'fatal'});
    }
});

/*
	Function: journal

	This is used to write an error to the error log file 667.txt. It should be used when logging to the error database has failed. If this also fails, the function will try to print to console the database & file write errors.

	Parameters:

        datedError - string, the timestamped database error
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
function writeToErrorLog(datedError,isError,idNumber,message,userID,lineNumber,functionName,fileName) {
    var fs = require('fs');
    fs.appendFile("error/667.txt",datedError,function(err) {
        /* print to console if write to error log failed */
        if(err) {
            /* as errors are more important, print if it was an error that was trying to be logged */
            if(isError) {
                console.log("xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + message + "')");
            }
            /* print database error and file write error */
            console.log('db: ' + datedError);
            console.log('fs: ' + err);
            console.log(' ');
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
		message - object, contains properties with error information.
		lineNumber - number, line number where the error or action occurred. should be set with global __line
		functionName - string, function where the error or action occurred. define __function
		scriptName - string, script file where the error or action occurred. shooud be set with global __filename

	Returns:

		nothing - *
*/
function journal(isError,idNumber,message,userID,lineNumber,functionName,scriptName) {
    var fileName = scriptName.split("/").pop();

    /* check that nothing is undefined as that will break journaling to database */
    var argCheck = [isError,idNumber,message,userID,lineNumber,functionName,scriptName];
    argCheck.forEach(function(item,index) {
        if(typeof item === 'undefined') {
            var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + 'undefined was passed to journal() function.';
            if(typeof message === 'string') {
                var escapedMessage = message.replace(/['"`]+/g,'');
            }
            writeToErrorLog(datedError,isError,idNumber,escapedMessage,userID,lineNumber,functionName,fileName);
        }
    });

	stats.getConnection(function(error,connection) {

        /* write to error log if failed to get connection */
        if (error) {
            var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + error;
            var escapedMessage = connection.escape(message).replace(/['"`]+/g,'');

            writeToErrorLog(datedError,isError,idNumber,escapedMessage,userID,lineNumber,functionName,fileName);
        }

        /* create query to journal data or error */
		var qry = "";
		if(isError) {
			qry = "INSERT INTO xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", '" + userID + "', NOW(), '" + connection.escape(message).replace(/['"`]+/g,'') + "')";
		} else {
			qry = "INSERT INTO xdata (scriptName, functionName, lineNumber, userID, eventTime) VALUES ('" + fileName + "', '" + functionName + "', " + lineNumber + ", '" + userID + "', NOW() )";
		}

		connection.query(qry,function(error,rows,fields) {
            /* write to error log if query failed */
			if (error) {
                var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + error;
                var escapedMessage = connection.escape(message).replace(/['"`]+/g,'');

                writeToErrorLog(datedError,isError,idNumber,escapedMessage,userID,lineNumber,functionName,fileName);
			}
		});

		connection.release();
	});
}

exports.journal = journal;

exports.saveViewData = function(uid,quality,pagetype,aid,xid) {
    var __function = "saveViewData";

    stats.getConnection(function(err,connection) {
        if (err) {
            journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
        } else {
            var qryArray = ["INSERT INTO xviews (ptype,aid,xid,viewtime,quality) VALUES ('",pagetype,"','",aid,"',",xid,",NOW(),",quality,")"];

            var qry = qryArray.join("");
            connection.query(qry,function(err,rows,fields) {
                if(err) {
                    err.input = qry;
                    journal(true,201,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
                }
            });
        }
    });
};
