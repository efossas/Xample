"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function saveblocks(request, response) {
    var __function = "saveblocks";
    var qs = require("querystring");
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
                var pid = POST.pid;
                var pagename = connection.escape(POST.pagename);
                var mediaType = POST.mediaType;
                var mediaContent = POST.mediaContent;
                var tid;
                var qryStatus;
                if (POST.tabid == 1) {
                    tid = "p_";
                    qryStatus = "UPDATE u_" + uid + " SET status=1 WHERE pid=" + pid;
                }
                else {
                    tid = "t_";
                    qryStatus = "UPDATE u_" + uid + " SET status=0 WHERE pid=" + pid;
                }
                connection.query(qryStatus, function (err, rows, fields) {
                    if (err) {
                        response.end("err");
                        utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                    }
                });
                var types = mediaType.split(",");
                var contents = mediaContent.split(",");
                var promisePage = utilities_2.changePagename(connection, uid, pid, pagename);
                promisePage.then(function (success) {
                    var qryTruncate = "TRUNCATE TABLE " + tid + uid + "_" + pid;
                    connection.query(qryTruncate, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 202, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (types[0] !== "undefined") {
                                var qryInsert = "INSERT INTO " + tid + uid + "_" + pid + " (bid,mediatype,mediacontent) VALUES ";
                                var i = 0;
                                var stop = types.length - 1;
                                while (i < stop) {
                                    qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + "),";
                                    i++;
                                }
                                qryInsert += "(" + i + "," + connection.escape(types[i]) + "," + connection.escape(contents[i]) + ")";
                                connection.query(qryInsert, function (err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        utilities_1.journal(true, 203, err, uid, __line, __function, __filename);
                                    }
                                    else {
                                        if (POST.tabid == 1) {
                                            utilities_2.deleteMedia(connection, uid, pid);
                                        }
                                        response.end("blockssaved");
                                        utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                                    }
                                });
                            }
                            else {
                                response.end("blockssaved");
                                if (POST.tabid == 1) {
                                    utilities_2.deleteMedia(connection, uid, pid);
                                }
                                utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                            }
                        }
                    });
                }, function (error) {
                    utilities_1.journal(true, 201, error, uid, __line, __function, __filename);
                });
                connection.release();
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = saveblocks;
