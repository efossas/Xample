"use strict";
var utilities_1 = require("../utilities");
var utilities_2 = require("../utilities");
function start(request, response) {
    var __function = "start";
    if (request.session.uid) {
        utilities_2.loadPage(request, response, "<script>pageHome();</script>");
        utilities_1.journal(false, 0, "", request.session.uid, __line, __function, __filename);
    }
    else {
        utilities_2.loadPage(request, response, "<script>pageLanding();</script>");
        utilities_1.journal(false, 0, "", 0, __line, __function, __filename);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = start;
