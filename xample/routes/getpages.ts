import { journal } from "../utilities";

/*
    Function: getpages

    Ajax, used to get a list of the user's xample pages. The data given to the http response is a comma-separate string in the following format. pid,pagename, If the user has no pages, an empty string is returned.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function getpages(request, response) {
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
}
