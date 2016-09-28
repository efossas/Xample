"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function editpage(request, response) {
    var __function = "editpage";
    var uid = request.session.uid;
    var pid = request.query.page;
    if (typeof uid === "undefined" || typeof pid === "undefined") {
        utilities_2.loadPage(request, response, "<script>pageError('noeditloggedout');</script>");
    }
    else {
        var temp = request.query.temp;
        var tid_1;
        var searchstatus_1;
        if (temp === "true") {
            tid_1 = "t_";
            searchstatus_1 = false;
        }
        else if (temp === "false") {
            tid_1 = "p_";
            searchstatus_1 = false;
        }
        else {
            tid_1 = "p_";
            searchstatus_1 = true;
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
            }
            var promise = utilities_2.searchPageStatus(connection, uid, pid);
            promise.then(function (success) {
                if (searchstatus_1 && success == 0) {
                    utilities_2.loadPage(request, response, "<script>pageChoose('" + pid + "');</script>");
                }
                else {
                    var qry = "SELECT pagename FROM u_" + uid + " WHERE pid=" + pid;
                    connection.query(qry, function (err, rows, fields) {
                        if (err) {
                            response.end("err");
                            utilities_1.journal(true, 201, err, uid, __line, __function, __filename);
                        }
                        else {
                            if (typeof rows[0] === "undefined") {
                                utilities_2.absentRequest(request, response);
                            }
                            else {
                                var pagename_1 = rows[0].pagename;
                                var qry_1 = "SELECT mediaType,mediaContent FROM " + tid_1 + uid + "_" + pid;
                                connection.query(qry_1, function (err, rows, fields) {
                                    if (err) {
                                        response.end("err");
                                        utilities_1.journal(true, 202, err, uid, __line, __function, __filename);
                                    }
                                    else {
                                        var pagedata = pid + "," + pagename_1;
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
                                        utilities_2.loadPage(request, response, "<script>pageEdit('" + pagedata + "');</script>");
                                        utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                                    }
                                });
                            }
                        }
                    });
                    connection.release();
                }
            }, function (error) {
                response.end("err");
                utilities_1.journal(true, 200, error, uid, __line, __function, __filename);
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = editpage;
