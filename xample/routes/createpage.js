"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function createpage(request, response) {
    var __function = "createpage";
    var qs = require("querystring");
    var fs = require("fs");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("nocreateloggedout");
    }
    else {
        var body_1 = "";
        request.on("data", function (data) {
            body_1 += data;
            if (body_1.length > 1e6) {
                request.connection.destroy();
                utilities_1.journal(true, 199, "Overload Attack!", 0, __line, __function, __filename);
            }
        });
        request.on("end", function () {
            pool.getConnection(function (err, connection) {
                if (err) {
                    utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
                }
                var POST = qs.parse(body_1);
                var pagename = connection.escape(POST.pagename);
                var subject = connection.escape(POST.subject);
                var category = connection.escape(POST.category);
                var topic = connection.escape(POST.topic);
                var promise = utilities_2.searchPagename(connection, uid, pagename);
                promise.then(function (success) {
                    if (success !== -1) {
                        response.end("pageexists");
                    }
                    else {
                        var qryUser = "INSERT INTO u_" + uid + " (pagename,status,subject,category,topic) VALUES (" + pagename + ",1," + subject + "," + category + "," + topic + ")";
                        connection.query(qryUser, function (err, rows, fields) {
                            if (err) {
                                response.end("err");
                                utilities_1.journal(true, 201, err, uid, __line, __function, __filename);
                            }
                            else {
                                var promisePid = utilities_2.searchPid(connection, uid, pagename);
                                promisePid.then(function (success) {
                                    if (success === -1) {
                                        response.end("err");
                                        utilities_1.journal(true, 203, "pid not found after page insert", uid, __line, __function, __filename);
                                    }
                                    else {
                                        var pid = success;
                                        var qryPage = "CREATE TABLE p_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";
                                        connection.query(qryPage, function (err, rows, fields) {
                                            if (err) {
                                                response.end("err");
                                                utilities_1.journal(true, 204, err, uid, __line, __function, __filename);
                                            }
                                        });
                                        var qryTemp = "CREATE TABLE t_" + uid + "_" + pid + " (bid TINYINT UNSIGNED, mediatype CHAR(5), mediacontent VARCHAR(4096) )";
                                        connection.query(qryTemp, function (err, rows, fields) {
                                            if (err) {
                                                response.end("err");
                                                utilities_1.journal(true, 205, err, uid, __line, __function, __filename);
                                            }
                                        });
                                        fs.mkdir(__dirname + "/" + GLOBALreroute + "xm/" + uid + "/" + pid, function (err) {
                                            if (err) {
                                                utilities_1.journal(true, 120, err, uid, __line, __function, __filename);
                                            }
                                        });
                                        response.end(pid.toString());
                                        utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                                    }
                                }, function (error) {
                                    response.end("err");
                                    utilities_1.journal(true, 202, error, uid, __line, __function, __filename);
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createpage;
