import { journal, deleteMedia, changePagename } from "../utilities";

/*
    Function: saveblocks

    Ajax, used to save the page content to the page table. The previous page table rows are deleted and new ones are added.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function saveblocks(request, response) {
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
}
