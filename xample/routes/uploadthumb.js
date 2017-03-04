/* eslint-env node, es6 */
/*
	Title: Upload Media
	Route for uploading media for block page.
*/

var analytics = require('./../analytics.js');
var filemedia = require('./../filemedia.js');

/*
	Function: uploadThumb

	Ajax, used to upload thumbnail to a user's page folder. If uploaded successfully, the user will get the absolute url to the uploaded thumbnail.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.uploadthumb = function(request,response) {
	var __function = "uploadthumb";

	var fs = require('fs');

	/* create response object */
	var result = {msg:"",data:{}};

	/* grab the user's id */
	var uid = request.session.uid;

	if(typeof uid === 'undefined') {
		result.msg = 'nouploadloggedout';
        response.end(JSON.stringify(result));
    } else {

		/* grab the did from the get query */
		var did = request.query.id;

		/* pipe the incoming request to the busboy app */
		var fstream;
        request.pipe(request.busboy);

        request.busboy.on('file',function(fieldname,file,filename) {
            /* set path to save the file, then pipe/save the file to that path */
			var reldir = "xm/" + uid + "/" + did + "/";
            var absdir = request.app.get('fileRoute') + reldir;

            /* replace spaces with underscores, fixes issues with shell commands */
            var oldfile = filename.replace(/ /g,"_");
            var fullpath = absdir + oldfile;

            /* save the file, then process it */
            fstream = fs.createWriteStream(fullpath);
            file.pipe(fstream);

            fstream.on('close',function() {
                /* media conversion */
                var promise = filemedia.convertMedia(response,oldfile,absdir,reldir,"thumb",uid,did);

                promise.then(function(mediapath) {
                    /* respond with the absolute url to the uploaded file */
					result.msg = 'success';
					result.data = request.root + mediapath;
					response.end(JSON.stringify(result));
                    analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
                },function(error) {
					result.msg = 'convertmediaerr';
					response.end(JSON.stringify(result));
                    /// remove bad media
                    analytics.journal(true,110,error,uid,global.__stack[1].getLineNumber(),__function,__filename);
                });
            });
        });
	}
};
