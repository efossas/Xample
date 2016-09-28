"use strict";
var utilities_1 = require("../utilities");
function revert(request, response) {
    var __function = "revert";
    var qs = require("querystring");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("norevertloggedout");
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
            var POST = qs.parse(body_1);
            if (typeof POST.pid === "undefined") {
                response.end("nopid");
            }
            else {
                var pid_1 = POST.pid;
                pool.getConnection(function (err, connection) {
                    if (err) {
                        utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
                    }
                    var qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid_1;
                    connection.query(qryStatus, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                        }
                        else {
                            var qryPageData = "SELECT mediaType,mediaContent FROM p_" + uid + "_" + pid_1;
                            connection.query(qryPageData, function (err, rows, fields) {
                                if (err) {
                                    response.end("err");
                                    utilities_1.journal(true, 201, err, uid, __line, __function, __filename);
                                }
                                else {
                                    var pagedata = "";
                                    var i = 0;
                                    var j = rows.length;
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
                                    response.end(pagedata);
                                    utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                                }
                            });
                        }
                    });
                    connection.release();
                });
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = revert;
