import { journal } from "../utilities";

export default function getsubjects(request, response) {
    const __function = "getsubjects";

    const fs = require("fs");

    /* get the user's id */
    const uid = request.session.uid;

    /* get the topics from the local json file */
    fs.readFile("data/topics.json", function(err, data) {
        if (err) {
            response.end("err");
            journal(true, 120, err, uid, __line, __function, __filename);
        } else {
            response.end(data.toString());
        }
    });
}
