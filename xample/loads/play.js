/* eslint-env node, es6 */
/*
	Title: Play Page
	Loads Play Page.
*/

var loader = require('./loader.js');

/*
	Function: play

	Page Play, for playing with Bengine

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.play = function(request,response) {
	var helper = require('../helper.js');

	var minified = helper.isMinified(request);

	var xamplejs = "<script src='" + request.root + "js/pl" + minified + ".js'></script>";

	var codemirrorjs = "<script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.js'></script>";
	var codemirrorcss = "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/codemirror.css'>";
	var codemirrormode = "<script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.24.2/mode/javascript/javascript.min.js'></script>";

	var customlinks = xamplejs + codemirrorjs + codemirrorcss + codemirrormode;

	loader.loadCustomPage(request,response,"<script>pagePlay();</script>",customlinks);
};
