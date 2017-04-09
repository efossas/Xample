/* eslint-env node, es6 */
/*
	Title: Loader
	Functions for loading html.
*/

function getTestingScripts(request,testscript) {
	var testingscripts = "";
	if(request.testing) {
		var mochacss = request.root + "css/mocha.css";
		var mochajs = request.root + "js/mocha.js";
		var chaijs = request.root + "js/chai.js";
		var testjs;
		switch(testscript) {
			case "page":
				testjs = request.root + "js/pagetests.js"; break;
			case "block":
				testjs = request.root + "js/blocktests.js"; break;
			case "lguide":
				testjs = request.root + "js/lguidetests.js"; break;
			default:
				return "";
		}
		testingscripts = `<div id="mocha"></div>
						<link rel="stylesheet" href="${mochacss}"/>
						<script src="${mochajs}"></script>
						<script src="${chaijs}"></script>
						<script>mocha.setup('bdd')</script>
						<script src="${testjs}"></script>
		`;
	}

	return testingscripts;
}

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
	Function: loadBlockPage

	This is used to load a block page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.

	Parameters:

		request - the http request
		response - the http response
		script - the front-end javascript function, it needs to have <script> tags

	Returns:

		nothing - *
*/
exports.loadBlockPage = function(request,response,script) {

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
	var wisestyle = "<link rel='stylesheet' href='" + request.root + "css/wisepool" + minified + ".css'>";

	var testingscripts = getTestingScripts(request,"block");

	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var pdfjs = "<script src='" + request.root + "js/pdf.min.js'></script>";
	var codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	var mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	var xamplejs = "<script src='" + request.root + "js/bp" + minified + ".js'></script>";

	var mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";
	var headend = "<title>Wisepool</title></head>";
	var body = "<body id='xample' class='xample'><div id='content'></div><footer class='footer'></footer>" + testingscripts;

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + codehighlightstyle + wisestyle + alertifyjs + pdfjs + codehighlightjs + mathjaxconfig + mathjaxjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("</body></html>");
};

/*
	Function: loadEmbedPage

	This is used to load an embeddable page.

	Parameters:

		request - the http request
		response - the http response
		script - the front-end javascript function, it needs to have <script> tags

	Returns:

		nothing - *
*/
exports.loadEmbedPage = function(request,response,script) {

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
	var wisestyle = "<link rel='stylesheet' href='" + request.root + "css/wisepool" + minified + ".css'>";

	var testingscripts = getTestingScripts(request,"block");

	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var pdfjs = "<script src='" + request.root + "js/pdf.min.js'></script>";
	var codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	var mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	var xamplejs = "<script src='" + request.root + "js/bp" + minified + ".js'></script>";

	var mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";
	var headend = "<title>Wisepool</title></head>";
	var body = "<body id='xample' class='xample'><div id='content-embed'></div>" + testingscripts;

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + codehighlightstyle + wisestyle + alertifyjs + pdfjs + codehighlightjs + mathjaxconfig + mathjaxjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("</body></html>");
};

/*
	Function: loadLearningGuidePage

	This is used to load a learning guide page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.

	Parameters:

		request - the http request
		response - the http response
		script - the front-end javascript function, it needs to have <script> tags

	Returns:

		nothing - *
*/
exports.loadLearningGuidePage = function(request,response,script) {

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
	var wisestyle = "<link rel='stylesheet' href='" + request.root + "css/wisepool" + minified + ".css'>";

	var testingscripts = getTestingScripts(request,"lguide");

	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var xamplejs = "<script src='" + request.root + "js/lg" + minified + ".js'></script>";

	var headend = "<title>Wisepool</title></head>";
	var body = "<body id='xample' class='xample'><div id='content'></div><footer class='footer'></footer>" + testingscripts;

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + wisestyle + alertifyjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("</body></html>");
};

/*
	Function: loadPage

	This is used to load a general page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.

	Parameters:

		request - the http request
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
	var wisestyle = "<link rel='stylesheet' href='" + request.root + "css/wisepool" + minified + ".css'>";

	var testingscripts = getTestingScripts(request,"page");

	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var xamplejs = "<script src='" + request.root + "js/nav" + minified + ".js'></script>";

	var headend = "<title>Wisepool</title></head>";
	var body = "<body id='xample' class='xample'><div id='content'></div><footer class='footer'></footer>" + testingscripts;

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + wisestyle + alertifyjs + xamplejs + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("</body></html>");
};

/*
	Function: loadPlayPage

	This is used to load the play page. It writes the <head> to the response which includes all library links. Then it writes the parameter "script" which is a javascript function on the front-end that should create the page. It finally writes some ending tags using response.end() to send the response.

	Parameters:

		request - the http request
		response - the http response
		script - the front-end javascript function, it needs to have <script> tags

	Returns:

		nothing - *
*/
exports.loadPlayPage = function(request,response,script) {

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
	var wisestyle = "<link rel='stylesheet' href='" + request.root + "css/wisepool" + minified + ".css'>";

	var alertifyjs = "<script src='" + request.root + "js/alertify.min.js'></script>";
	var xamplejs = "<script src='" + request.root + "js/pl" + minified + ".js'></script>";

	var codemirrorjs = "<script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.js'></script>";
	var codemirrorcss = "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.css'>";
	var codemirrormode = "<script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/mode/javascript/javascript.min.js'></script>";

	var headend = "<title>Wisepool</title></head>";
	var body = "<body id='xample' class='xample'><div id='content'></div><footer class='footer'></footer>";

	/* write the <head> */
	response.write(headstart + viewport + alertifycorestyle + alertifydefaultstyle + wisestyle + alertifyjs + xamplejs + codemirrorjs + codemirrorcss + codemirrormode + headend + body);

	/* write the <script> */
	response.write(script);

	/* close tags & send the http response */
	response.end("</body></html>");
};
