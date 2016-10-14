/* eslint-env node, es6 */
/* eslint no-console: "off" */

/*
	Title: Stats
	This contains a function for journaling analytics.
*/

/* global __stack:true */
/* global __line:true */

/* These set __line to return the current line number where they are used. They are used for logging errors.  */
Object.defineProperty(global,'__stack',{
get: function stacker() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_,stack) {
            return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err,stacker); /// was arguments.callee instead of stacker
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

exports.__stack = __stack;
exports.__line = __stack[1].getLineNumber();

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
    }
});

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
exports.journal = function(isError,idNumber,message,userID,lineNumber,functionName,scriptName) {
	var fileName = scriptName.split("/").pop();

	stats.getConnection(function(error,connection) {

        if (error) {
            var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + error;

            var fs = require('fs');
            fs.appendFile("error/667.txt",datedError,function(err) {
                if(err) {
                    if(isError) {
                        console.log("xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + connection.escape(message).replace(/['"`]+/g,'') + "')");
                    }
                    console.log('db: ' + datedError);
                    console.log('fs: ' + err);
                    console.log(' ');
                }
            });
        }

		var qry = "";
		if(isError) {
			qry = "INSERT INTO xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + connection.escape(message).replace(/['"`]+/g,'') + "')";
		} else {
			qry = "INSERT INTO xdata (scriptName, functionName, lineNumber, userID, eventTime) VALUES ('" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW() )";
		}

		connection.query(qry,function(error,rows,fields) {
			if (error) {
                var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + error;

                var fs = require('fs');
                fs.appendFile("error/667.txt",datedError,function(err) {
                    if(err) {
                        if(isError) {
                            console.log("xerror (id, scriptName, functionName, lineNumber, userID, eventTime, message) VALUES (" + idNumber + ", '" + fileName + "', '" + functionName + "', " + lineNumber + ", " + userID + ", NOW(), '" + connection.escape(message).replace(/['"`]+/g,'') + "')");
                        }
                        console.log('db: ' + datedError);
                        console.log('fs: ' + err);
                        console.log(' ');
                    }
                });
			}
		});

		connection.release();
	});
};
