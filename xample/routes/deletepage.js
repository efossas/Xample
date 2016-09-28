"use strict";
var utilities_1 = require("../utilities");
function deletepage(request, response) {
    var __function = "deletepage";
    var qs = require("querystring");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("nodeleteloggedout");
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
                    response.end("err");
                }
                else {
                    var POST = qs.parse(body_1);
                    var pid = connection.escape(POST.pid).replace(/'/g, "");
                    var qryDeleteRow = "DELETE FROM u_" + uid + " WHERE pid=" + pid;
                    var qryDeletePermPage = "DROP TABLE p_" + uid + "_" + pid;
                    var qryDeleteTempPage = "DROP TABLE t_" + uid + "_" + pid;
                    var firstQryComplete_1 = false;
                    var secondQryComplete_1 = false;
                    connection.query(qryDeleteRow, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (firstQryComplete_1 && secondQryComplete_1) {
                                response.end("success");
                                utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                            }
                            else if (firstQryComplete_1) {
                                secondQryComplete_1 = true;
                            }
                            else {
                                firstQryComplete_1 = true;
                            }
                        }
                    });
                    connection.query(qryDeletePermPage, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (firstQryComplete_1 && secondQryComplete_1) {
                                response.end("success");
                                utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                            }
                            else if (firstQryComplete_1) {
                                secondQryComplete_1 = true;
                            }
                            else {
                                firstQryComplete_1 = true;
                            }
                        }
                    });
                    connection.query(qryDeleteTempPage, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (firstQryComplete_1 && secondQryComplete_1) {
                                response.end("success");
                                utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                            }
                            else if (firstQryComplete_1) {
                                secondQryComplete_1 = true;
                            }
                            else {
                                firstQryComplete_1 = true;
                            }
                        }
                    });
                    connection.release();
                }
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deletepage;
