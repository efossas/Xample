/* eslint-env browser, es6 */
/*
	Title: Wisepool
	This is the front-end for Xample General Pages
*/

/*
	Section: Helper Functions
	These are helper functions.
*/

// <<<code>>>

/*
	Function: createURL

	Detects local or remote host and constructs desired url.

	Parameters:

		path - The path or the url after the host, like http://localhost:80 + path

	Returns:

		nothing - *
*/
function createURL(path) {
	var url = window.location.href;
	var splitUrl = url.split("/");

	/* detect local or remote routes */
	if(splitUrl[2].match(/localhost.*/)) {
		url = splitUrl[0] + "//" + splitUrl[2] + path;
	} else {
		url = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + path;
	}

	return url;
}

/*
	Function: emptyDiv

	Find a div by id and remove its contents.

	Parameters:

		divId - The id of the div whose contents will be removed

	Returns:

		nothing - *
*/
function emptyDiv(node) {

	if(typeof node === "string") {
		var nodeDiv = document.getElementById(node);

		while (nodeDiv.hasChildNodes()) {
			nodeDiv.removeChild(nodeDiv.lastChild);
		}
	} else if (typeof node === "object") {
		while (node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}
	}
}

// <<<fold>>>

/*
	Section: Display Functions
	These are functions to create, remove, or show page elements (except for blocks).
*/

// <<<code>>>

/*
	Function: pageLanding

	Dispaly the landing page. The logstatus is used purely for displaying a login/signup form vs a link to the home page. Do not use it to display any sensitive data.

	Parameters:

		logstatus - boolean, true if logged in or false otherwise.

	Returns:

		nothing - *
*/
function pageLanding(logstatus) {
	var main = document.getElementById("content");

	main.innerHTML = "hi there";
}

// <<<fold>>>
