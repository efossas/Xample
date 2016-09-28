import { journal, searchUid } from "../utilities";

/*
    Function: signup

    Ajax, handles the sign up routine.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function signup(request, response) {
    const __function = "signup";

    const qs = require("querystring");
    const ps = require("password-hash");
    const fs = require("fs");

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
            const hash = ps.generate(POST.password);

            /* get only numbers from the phone number */
            const phone = POST.phone.replace(/\D/g, "");

            /* escape these to prevent MySQL injection */
            const username = connection.escape(POST.username);
            const email = connection.escape(POST.email);

            /* check if username already exists */
            const promise = searchUid(connection, username);

            promise.then(function(success) {

                if (success !== -1) {
                    response.end("exists");
                } else {
                    const qryUser = "INSERT INTO Users (username,password,email,phone,autosave,defaulttext) VALUES (" + username + ",'" + hash + "'," + email + ",'" + phone + "',0,1)";

                    /* create the user in the Users table */
                    connection.query(qryUser, function(err, rows, fields) {

                        if (err) {
                            response.end("err");
                            journal(true, 201, err, 0, __line, __function, __filename);
                        } else {
                            const qryUid = "SELECT uid FROM Users WHERE username = " + username;

                            /* retrieve the user's new uid */
                            connection.query(qryUid, function(err, rows, fields) {
                                if (err) {
                                    response.end("err");
                                    journal(true, 202, err, 0, __line, __function, __filename);
                                } else {
                                    const uid = rows[0].uid;
                                    const qryTable = "CREATE TABLE u_" + uid + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32))";

                                    /* create the user's page table */
                                    connection.query(qryTable, function(err, rows, fields) {
                                        if (err) {
                                            response.end("err");
                                            journal(true, 203, err, 0, __line, __function, __filename);
                                        } else {
                                            /* make the user's directory to store pages in later */
                                            request.session.uid = uid;
                                            fs.mkdir(__dirname + "/" + GLOBALreroute + "xm/" + uid, function(err) {
                                                if (err) {
                                                    journal(true, 120, err, 0, __line, __function, __filename);
                                                }
                                            });
                                            response.end("success");
                                            journal(false, 0, "", uid, __line, __function, __filename);
                                        }
                                    });
                                }
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
