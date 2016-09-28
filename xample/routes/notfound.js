"use strict";
var utilities_1 = require("../utilities");
function notfound(request, response) {
    response.status(404);
    utilities_1.loadPage(request, response, "<script>pageError('notfound');</script>");
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notfound;
