"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function profile(request, response) {
    var __function = "profile";
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        utilities_2.loadPage(request, response, "<script>pageProfile('noprofileloggedout');</script>");
    }
    else {
        var qry_1 = "SELECT username,email,phone,autosave,defaulttext FROM Users WHERE uid=" + uid;
        pool.getConnection(function (err, connection) {
            if (err) {
                utilities_1.journal(true, 221, err, uid, __line, __function, __filename);
            }
            connection.query(qry_1, function (err, rows, fields) {
                if (err) {
                    utilities_2.loadPage(request, response, "<script>pageProfile('err');</script>");
                    utilities_1.journal(true, 200, err, uid, __line, __function, __filename);
                }
                else {
                    var data = {};
                    data["username"] = rows[0].username;
                    data["email"] = rows[0].email;
                    data["phone"] = rows[0].phone;
                    data["autosave"] = rows[0].autosave;
                    data["defaulttext"] = rows[0].defaulttext;
                    var profiledata = JSON.stringify(data);
                    utilities_2.loadPage(request, response, "<script>pageProfile('" + profiledata + "');</script>");
                    utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                }
            });
            connection.release();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = profile;
