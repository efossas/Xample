"use strict";
var utilities_1 = require("../utilities");
function login(request, response) {
    var __function = "login";
    var qs = require("querystring");
    var ps = require("password-hash");
    var body = "";
    request.on("data", function (data) {
        body += data;
        if (body.length > 1e6) {
            request.connection.destroy();
            utilities_1.journal(true, 199, "Overload Attack!", 0, __line, __function, __filename);
        }
    });
    request.on("end", function () {
        pool.getConnection(function (err, connection) {
            if (err) {
                utilities_1.journal(true, 221, err, 0, __line, __function, __filename);
            }
            var POST = qs.parse(body);
            var username = connection.escape(POST.username);
            var promise = utilities_1.searchUid(connection, username);
            promise.then(function (success) {
                if (success === -1) {
                    response.end("notfound");
                }
                else {
                    var uid_1 = success;
                    var qry = "SELECT password FROM Users WHERE uid = '" + uid_1 + "'";
                    connection.query(qry, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 201, err, 0, __line, __function, __filename);
                        }
                        else {
                            if (ps.verify(POST.password, rows[0].password)) {
                                request.session.uid = uid_1;
                                response.end("loggedin");
                                utilities_1.journal(false, 0, "", uid_1, __line, __function, __filename);
                            }
                            else {
                                response.end("incorrect");
                            }
                        }
                    });
                }
            }, function (error) {
                response.end("err");
                utilities_1.journal(true, 200, error, 0, __line, __function, __filename);
            });
            connection.release();
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = login;
