/* eslint-env node, es6 */
/*
	Title: Tutorial Page.
	Loads Tutorial Page.
*/

var loader = require('./loader.js');

/*
	Function: tutorial

	Page Tutorial, for explaining WisePool

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.tutorial = function(request,response) {
	var helper = require('../helper.js');

	var minified = helper.isMinified(request);

	/* STYLES - specific to this page */
	var codehighlightstyle = "<link rel='stylesheet' href='" + request.root + "css/vs.css'>";

	/* JAVASCRIPT - specific to this page */
	var pdfjs = "<script src='" + request.root + "js/pdf.min.js'></script>";
	var codehighlightjs = "<script src='//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'></script>";
	var mathjaxjs = "<script type='text/javascript' src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
	var nocaptchajs = "<script src='https://www.google.com/recaptcha/api.js' async></script>";
	var xampleBpjs = "<script src='" + request.root + "js/bp" + minified + ".js'></script>";
	var xampleTutjs = "<script src='" + request.root + "js/tut" + minified + ".js'></script>";

	var mathjaxconfig = "<script type='text/x-mathjax-config'>MathJax.Hub.Config({ tex2jax: { processClass: 'latexImage', ignoreClass: 'xample' }, mml2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, asciimath2jax: { processClass: 'mathImage', ignoreClass: 'xample' }, messageStyle: 'none' });</script>";

	var googleAnalyticsjs = `<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', 'UA-97401350-1', 'auto');ga('send', 'pageview');</script>`;

	var customlinks = codehighlightstyle + pdfjs + codehighlightjs + mathjaxjs + mathjaxconfig + xampleBpjs + xampleTutjs + nocaptchajs + googleAnalyticsjs;

	loader.loadCustomPage(request,response,"<script>pageTutorial();</script>",customlinks);
};
