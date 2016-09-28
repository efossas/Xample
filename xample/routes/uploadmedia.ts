import { journal, convertMedia } from "../utilities";

/*
    Function: uploadMedia

    Ajax, used to upload media to a user's page folder. If uploaded successfully, the user will get the absolute url to the uploaded media file.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function uploadmedia(request, response) {
    const __function = "uploadmedia";

    const fs = require("fs");

    /* grab the user's id */
    const uid = request.session.uid;

    if (typeof uid === "undefined") {
        response.end("nouploadloggedout");
    } else {

        /* grab the pid and block type from the get query */
        const pid = request.query.pid;
        const btype = request.query.btype;

        /* pipe the incoming request to the busboy app */
        let fstream;
        request.pipe(request.busboy);

        request.busboy.on("file", function(fieldname, file, filename) {
            /* set path to save the file, then pipe/save the file to that path */
            const dir = "xm/" + uid + "/" + pid + "/";

            /* replace spaces with underscores, fixes issues with shell commands */
            const link = dir + filename.replace(/ /g, "_");
            const fullpath = __dirname + "/../public_html/" + link;

            /* save the file, then process it */
            fstream = fs.createWriteStream(fullpath);
            file.pipe(fstream);

            fstream.on("close", function() {
                /* media conversion */
                const promise = convertMedia(response, link, dir, btype, uid, pid);

                promise.then(function(success) {
                    /* respond with the absolute url to the uploaded file */
                    response.end(request.root + success);
                    journal(false, 0, "", uid, __line, __function, __filename);
                }, function(error) {
                    response.end("convertmediaerr");
                    /// remove bad media
                    journal(true, 110, error, uid, __line, __function, __filename);
                });
            });
        });
    }
}
