import { journal } from "../utilities";

/*
    Function: saveprofile

    Saves profile data to the database.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function saveprofile(request, response) {
    const __function = "saveprofile";

    const qs = require("querystring");
    const ps = require("password-hash");

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

        /* when the request ends, parse the POST data, & process the sql queries */
        request.on("end", function() {
            pool.getConnection(function(err, connection) {
                if (err) {
                    journal(true, 221, err, uid, __line, __function, __filename);
                }

                const POST = qs.parse(body);

                /* profile data that requires checks should be queried here and deleted */
                if (Object.prototype.hasOwnProperty.call(POST, "newPass")) {
                    const currentPassword = POST.currentPass;
                    const newPassword = POST.newPass;

                    const qryGetPass = "SELECT password FROM Users WHERE uid=" + uid;

                    connection.query(qryGetPass, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                            response.end("err");
                            journal(true, 200, err, uid, __line, __function, __filename);
                        } else {
                            if (ps.verify(currentPassword, rows[0].password)) {
                                const hash = ps.generate(newPassword);
                                const qryUpdatePass = "UPDATE Users SET password='" + hash + "' WHERE uid=" + uid;

                                connection.query(qryUpdatePass, function(err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        journal(true, 201, err, uid, __line, __function, __filename);
                                    } else {
                                        /// if only
                                    }
                                });
                            }
                        }
                    });

                    delete POST.currentPass;
                    delete POST.newPass;
                }

                const keys = Object.keys(POST);
                const count = keys.length;

                /* count could be less than one, if say, only password was being updated */
                if (count < 1) {
                    response.end("profilesaved");
                    journal(false, 0, "", uid, __line, __function, __filename);
                } else {
                    const qryArray = ["UPDATE Users SET "];

                    for (let i = 0; i < count; i++) {
                        const current = keys[i];
                        qryArray.push(current + "=" + connection.escape(POST[current]) + " ");
                    }

                    qryArray.push("WHERE uid=" + uid);
                    const qry = qryArray.join("");

                    connection.query(qry, function(err, rows, fields) {
                        if (err) {
                            response.end("err");
                            journal(true, 203, err, uid, __line, __function, __filename);
                        } else {
                            response.end("profilesaved");
                            journal(false, 0, "", uid, __line, __function, __filename);
                        }
                    });
                }
                connection.release();
            });
        });
    }
}
