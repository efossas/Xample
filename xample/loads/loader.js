/* eslint-env node, es6 */
/*
	Title: Loader
	Functions for loading html.
*/

/*
	Function: absentRequest

	This is returns a 404 type page where a user tried to access a page that could not be found in the database.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.absentRequest = function(request,response) {
	/// replace this with loadpage() that loads a 404 type page not found template */
	response.end('Page Not Found');
};

/*
	Function: loadPage

	This is used to load a page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.

	Parameters:

		response - the http response
		script - the front-end javascript function, it needs to have <script> tags

	Returns:

		nothing - *
*/
exports.loadPage = function(request,response,script) {

    /* use minified code unless running from localhost */
    var minified = ".min";
    if(request.root.indexOf("localhost") > 0) {
        minified = "";
    }

	/* define the library & style links here */
	var headstart = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
	var viewport = "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
	var alertifycorestyle = "<link rel='stylesheet' href='" + request.root + "css/alertify.core.css'>";
	var alertifydefaultstyle = "<link rel='stylesheet' href='" + request.root + "css/alertify.default.css'>";
	var codehighlightstyle = "<link rel='stylesheet' href='" + request.root + "css/vs.css'>";
	var blockstyle = "<link rel='stylesheet' href='" + request.root + "css/block" + minified + ".css'>";
	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var pdfjs = "<script src='" + request.root + "js/pdf.min.js'></script>";
	var codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	var mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	var xamplejs = "<script src='" + request.root + "js/navigation" + minified + ".js'></script>";
	var mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";
	var headend = "<title>Abaganon Xample</title></head>";
	var body = "<body class='xample'><div id='content'></div>";

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + codehighlightstyle + blockstyle + alertifyjs + pdfjs + codehighlightjs + mathjaxconfig + mathjaxjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("<footer></footer></body></html>");
};
