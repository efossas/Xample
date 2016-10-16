/* eslint-env browser, es6 */
/*****
	Title: Learning Guide
	This is the front-end for Xample Learning Guides
*****/

/***
	Section: Helper Functions
	These are helper functions.
***/

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

/***
	Section: Display Functions
	These are functions to create, remove, or show page elements (except for blocks).
***/

// <<<code>>>

/*
	Function: pageEditLG

	Display the page for editing the learning guide.

	Parameters:

		guidedata - string, guide data is received in the format gid,guidename,(listnumber,link&link&etc,) etc.

	Returns:

		nothing - *
*/
function pageEditLG(guidedata) {
	var main = document.getElementById("content");

	main.innerHTML = "hi there";
}

// <<<fold>>>
