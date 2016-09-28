"use strict";
var utilities_1 = require("../utilities");
function getpages(request, response) {
    var __function = "getpages";
    var uid = request.session.uid;
    var qry = "SELECT pid,pagename FROM u_" + uid;
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
                var pages = "";
                var i = 0;
                var j = rows.length;
                while (j > 1) {
                    pages += rows[i].pid + "," + rows[i].pagename + ",";
                    i++;
                    j--;
                }
                if (j === 1) {
                    pages += rows[i].pid + "," + rows[i].pagename;
                }
                response.end(pages);
                utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
            }
        });
        connection.release();
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getpages;
