import { journal } from "../utilities";

/*
    Function: getprofiledata

    Grabs profile information and returns it.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function getprofiledata(request, response) {
    const __function = "getprofiledata";

    const qs = require("querystring");

    /* grab the user's id */
    const uid = request.session.uid;

    if (typeof uid === "undefined") {
        response.end("noprofiledataloggedout");
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

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on("end", function() {

            const POST = qs.parse(body);

            const qry = "SELECT " + POST.fields + " FROM Users WHERE uid=" + uid;

            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, uid, __line, __function, __filename);
                }

                connection.query(qry, function(err, rows, fields) {
                    if (err) {
                        response.end("err");
                        journal(true, 200, err, uid, __line, __function, __filename);
                    } else {
                        const profiledata = JSON.stringify(rows[0]);

                        response.end(profiledata);
                        journal(false, 0, "", uid, __line, __function, __filename);
                    }
                });
                connection.release();
            });
        });
    }
};
