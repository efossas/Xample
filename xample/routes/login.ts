import { journal, searchUid } from "../utilities";

/*
    Function: login

    Ajax, handles the log in routine.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function login(request, response) {
    const __function = "login";

    const qs = require("querystring");
    const ps = require("password-hash");

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
                journal(true, 221, err, 0, __line, __function, __filename);
            }

            const POST = qs.parse(body);

            /* change info as needed */
            const username = connection.escape(POST.username);

            /* check if username already exists */
            const promise = searchUid(connection, username);

            promise.then(function(success) {

                if (success === -1) {
                    response.end("notfound");
                } else {
                    const uid = success;

                    const qry = "SELECT password FROM Users WHERE uid = '" + uid + "'";

                    /* retrieve the user's password */
                    connection.query(qry, function(err, rows, fields) {
                        if (err) {
                            response.end("err");
                            journal(true, 201, err, 0, __line, __function, __filename);
                        } else {
                            /* check that the entered password matches the stored password */
                            if (ps.verify(POST.password, rows[0].password)) {
                                /* set the user's session, this indicates logged in status */
                                request.session.uid = uid;
                                response.end("loggedin");
                                journal(false, 0, "", uid, __line, __function, __filename);
                            } else {
                                response.end("incorrect");
                            }
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
