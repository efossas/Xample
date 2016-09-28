import { journal } from "../utilities";

/*
    Function: deletepage

    Ajax, handles the page deletion routine.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function deletepage(request, response) {
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
}
