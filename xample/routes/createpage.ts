import { journal } from "../utilities";
import { searchPid, searchPagename } from "../utilities";

/*
    Function: createpage

    Ajax, handles the page creation routine.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function createpage(request, response) {
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
}
