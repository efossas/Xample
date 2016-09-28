import { journal } from "../utilities";

/*
    Function: revert

    Copies the temporary table to the permanent table, then sends the rows of data.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function revert(request, response) {
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
}
