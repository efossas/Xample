"use strict";
var utilities_1 = require("../utilities");
function getsubjects(request, response) {
    var __function = "getsubjects";
    var fs = require("fs");
    var uid = request.session.uid;
    fs.readFile("data/topics.json", function (err, data) {
        if (err) {
            response.end("err");
            utilities_1.journal(true, 120, err, uid, __line, __function, __filename);
        }
        else {
            response.end(data.toString());
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getsubjects;
