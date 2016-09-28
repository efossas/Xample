import { journal, loadPage, searchPageStatus, absentRequest } from "../utilities";

/*
    Function: editpage

    Page Edit Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the user does not have a page with that pid, they will receive "err" in the response. If the user has no media on that page, the user will only receive the pid and pagename.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function editpage(request, response) {
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
}
