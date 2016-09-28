"use strict";
var utilities_1 = require("../utilities");
function logout(request, response) {
    var __function = "logout";
    var uid = request.session.uid;
    request.session.destroy();
    response.end("loggedout");
    utilities_1.journal(false, 0, "", uid, __line, __function, __filename);
    uid = "";
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logout;
