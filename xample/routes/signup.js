"use strict";
var utilities_1 = require("../utilities");
function signup(request, response) {
    var __function = "signup";
    var qs = require("querystring");
    var ps = require("password-hash");
    var fs = require("fs");
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
            var hash = ps.generate(POST.password);
            var phone = POST.phone.replace(/\D/g, "");
            var username = connection.escape(POST.username);
            var email = connection.escape(POST.email);
            var promise = utilities_1.searchUid(connection, username);
            promise.then(function (success) {
                if (success !== -1) {
                    response.end("exists");
                }
                else {
                    var qryUser = "INSERT INTO Users (username,password,email,phone,autosave,defaulttext) VALUES (" + username + ",'" + hash + "'," + email + ",'" + phone + "',0,1)";
                    connection.query(qryUser, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 201, err, 0, __line, __function, __filename);
                        }
                        else {
                            var qryUid = "SELECT uid FROM Users WHERE username = " + username;
                            connection.query(qryUid, function (err, rows, fields) {
                                if (err) {
                                    response.end("err");
                                    utilities_1.journal(true, 202, err, 0, __line, __function, __filename);
                                }
                                else {
                                    var uid_1 = rows[0].uid;
                                    var qryTable = "CREATE TABLE u_" + uid_1 + " (pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(50), status BOOLEAN, subject VARCHAR(32), category VARCHAR(32), topic VARCHAR(32))";
                                    connection.query(qryTable, function (err, rows, fields) {
                                        if (err) {
                                            response.end("err");
                                            utilities_1.journal(true, 203, err, 0, __line, __function, __filename);
                                        }
                                        else {
                                            request.session.uid = uid_1;
                                            fs.mkdir(__dirname + "/" + GLOBALreroute + "xm/" + uid_1, function (err) {
                                                if (err) {
                                                    utilities_1.journal(true, 120, err, 0, __line, __function, __filename);
                                                }
                                            });
                                            response.end("success");
                                            utilities_1.journal(false, 0, "", uid_1, __line, __function, __filename);
                                        }
                                    });
                                }
                            });
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
exports.default = signup;
