"use strict";
var utilities_1 = require("../utilities");
function getprofiledata(request, response) {
    var __function = "getprofiledata";
    var qs = require("querystring");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("noprofiledataloggedout");
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
            var qry = "SELECT " + POST.fields + " FROM Users WHERE uid=" + uid;
            pool.getConnection(function (err, connection) {
                if (err) {
                    utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
                }
                connection.query(qry, function (err, rows, fields) {
                    if (err) {
                        response.end("err");
                        utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                    }
                    else {
                        var profiledata = JSON.stringify(rows[0]);
                        response.end(profiledata);
                        utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                    }
                });
                connection.release();
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getprofiledata;
;
