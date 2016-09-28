"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function uploadmedia(request, response) {
    var __function = "uploadmedia";
    var fs = require("fs");
    var uid = request.session.uid;
    if (typeof uid === "undefined") {
        response.end("nouploadloggedout");
    }
    else {
        var pid_1 = request.query.pid;
        var btype_1 = request.query.btype;
        var fstream_1;
        request.pipe(request.busboy);
        request.busboy.on("file", function (fieldname, file, filename) {
            var dir = "xm/" + uid + "/" + pid_1 + "/";
            var link = dir + filename.replace(/ /g, "_");
            var fullpath = __dirname + "/../public_html/" + link;
            fstream_1 = fs.createWriteStream(fullpath);
            file.pipe(fstream_1);
            fstream_1.on("close", function () {
                var promise = utilities_2.convertMedia(response, link, dir, btype_1, uid, pid_1);
                promise.then(function (success) {
                    response.end(request.root + success);
                    utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
                }, function (error) {
                    response.end("convertmediaerr");
                    utilities_1.journal(true, 110, error, uid, __line, __function, __filename);
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uploadmedia;
