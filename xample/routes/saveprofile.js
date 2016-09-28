"use strict";
var utilities_1 = require("../utilities");
function saveprofile(request, response) {
    var __function = "saveprofile";
    var qs = require("querystring");
    var ps = require("password-hash");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("nosaveloggedout");
    }
    else {
        var body_1 = "";
        request.on("data", function (data) {
            body_1 += data;
            if (body_1.length > 1e6) {
                request.connection.destroy();
                utilities_1.journal(true, 199, "Overload Attack!", uid, __line, __function, __filename);
            }
        });
        request.on("end", function () {
            pool.getConnection(function (err, connection) {
                if (err) {
                    utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
                }
                var POST = qs.parse(body_1);
                if (Object.prototype.hasOwnProperty.call(POST, "newPass")) {
                    var currentPassword_1 = POST.currentPass;
                    var newPassword_1 = POST.newPass;
                    var qryGetPass = "SELECT password FROM Users WHERE uid=" + uid;
                    connection.query(qryGetPass, function (err, rows, fields) {
                        if (err) {
                            console.log(err);
                            response.end("err");
                            utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (ps.verify(currentPassword_1, rows[0].password)) {
                                var hash = ps.generate(newPassword_1);
                                var qryUpdatePass = "UPDATE Users SET password='" + hash + "' WHERE uid=" + uid;
                                connection.query(qryUpdatePass, function (err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        utilities_1.journal(true, 201, err, uid, __line, __function, __filename);
                                    }
                                    else {
                                    }
                                });
                            }
                        }
                    });
                    delete POST.currentPass;
                    delete POST.newPass;
                }
                var keys = Object.keys(POST);
                var count = keys.length;
                if (count < 1) {
                    response.end("profilesaved");
                    utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                }
                else {
                    var qryArray = ["UPDATE Users SET "];
                    for (var i = 0; i < count; i++) {
                        var current = keys[i];
                        qryArray.push(current + "=" + connection.escape(POST[current]) + " ");
                    }
                    qryArray.push("WHERE uid=" + uid);
                    var qry = qryArray.join("");
                    connection.query(qry, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 203, err, uid, __line, __function, __filename);
                        }
                        else {
                            response.end("profilesaved");
                            utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                        }
                    });
                }
                connection.release();
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = saveprofile;
