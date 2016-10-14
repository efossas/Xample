/* eslint-env node, es6 */
/*
	Title: Upload Media
	Route for uploading media for block page.
*/

var analytics = require('./../analytics.js');
var filemedia = require('./../filemedia.js');

/*
	Function: uploadMedia

	Ajax, used to upload media to a user's page folder. If uploaded successfully, the user will get the absolute url to the uploaded media file.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.uploadmedia = function(request,response) {
	var __function = "uploadmedia";

	var fs = require('fs');

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
        response.end('nouploadloggedout');
    } else {

		/* grab the pid and block type from the get query */
		var pid = request.query.pid;
		var btype = request.query.btype;

		/* pipe the incoming request to the busboy app */
		var fstream;
        request.pipe(request.busboy);

        request.busboy.on('file',function(fieldname,file,filename) {
            /* set path to save the file, then pipe/save the file to that path */
			var reldir = "xm/" + uid + "/" + pid + "/";
            var absdir = request.app.get('fileRoute') + reldir;

            /* replace spaces with underscores, fixes issues with shell commands */
            var oldfile = filename.replace(/ /g,"_");
            var fullpath = absdir + oldfile;

            /* save the file, then process it */
            fstream = fs.createWriteStream(fullpath);
            file.pipe(fstream);

            fstream.on('close',function() {
                /* media conversion */
                var promise = filemedia.convertMedia(response,oldfile,absdir,reldir,btype,uid,pid);

                promise.then(function(success) {
                    /* respond with the absolute url to the uploaded file */
                    response.end(request.root + success);
                    analytics.journal(false,0,"",uid,analytics.__line,__function,__filename);
                },function(error) {
                    response.end('convertmediaerr');
                    /// remove bad media
                    analytics.journal(true,110,error,uid,analytics.__line,__function,__filename);
                });
            });
        });
	}
};
