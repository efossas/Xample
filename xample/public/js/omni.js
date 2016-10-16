/* eslint-env browser, es6 */
/*****
	Title: Omni
	This contains front-end functions that are pretty much used on all page-types. This should be added to other front-end js files with a bash script.
*****/

/* list any objects from other js files here */
/*
	global alertify:true
*/

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
	Section: Menu Redirect Functions
	These are functions for the top menu which redirect to a different page.
***/

// <<<code>>>

/*
	Function: logout

	This function logs a user out.

	Parameters:

		none

	Returns:

		nothing - *
*/
function logout() {

	/* create the url destination for the ajax request */
	var url = createURL("/logout");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "loggedout") {
					window.location = createURL("/");
				} else {
					alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send();
}

// <<<fold>>>

/***
	Section: Display Functions
	These are functions that produce html elements.
***/

// <<<code>>>

/*
	Function: btnLink

	Creates a button that calls a link.

	Parameters:

		text - string, text to display inside button
		url - string, the href link
		color - the button's color

	Returns:

		success - html node, link button
*/
function btnLink(text,url,color) {
	var linkbtn = document.createElement('a');
	linkbtn.setAttribute('class','btn ' + color + '-btn');
	linkbtn.setAttribute('href',url);
	linkbtn.setAttribute('target','_blank');
	linkbtn.setAttribute('value',text);
	linkbtn.innerHTML = text;

	return linkbtn;
}

/*
	Function: btnSubmit

	Creates a button that calls a function.

	Parameters:

		text - string, text to display inside button
		funcName - string/function, the function name to call without the parentheses or the actual function
		color - the button's color

	Returns:

		success - html node, function button
*/
function btnSubmit(text,funcName,color) {
	var submit = document.createElement('button');
	submit.setAttribute('type','');
	submit.setAttribute('class','menubtn ' + color + '-btn');
	submit.setAttribute('value','submit');

	if(typeof funcName === 'string') {
		submit.setAttribute('onclick',funcName + '();');
	} else {
		submit.onclick = funcName;
	}

	submit.innerHTML = text;

	return submit;
}

// <<<fold>>>

/***
	Section: Page Functions
	These are functions loading pages.
***/

/*
	Function: pageError

	This function loads an error page that displays info on the error that occurred.

	Parameters:

		error - string indicating the type of error

	Returns:

		nothing - *
*/
function pageError(error) {
	var errorMessage = document.createElement("div");
	if(error === "noeditloggedout") {
		errorMessage.innerHTML = "You Cannot Edit The Requested Page Because You Are Logged Out.";
	} else if(error === "notfound") {
		errorMessage.innerHTML = "There URL You Requested Does Not Exist";
	}

	var main = document.getElementById('content');
	main.appendChild(errorMessage);
}

/***
	Section: Ajax Functions
	These are functions to retrieve data from the back-end.
***/

// <<<code>>>

/*
   Function: getUserFields

   Use this to get any user information from the user database.

   Parameters:

      fields - array, each element in the array must match a database column name

   Returns:

      Promise - on error: "err", on success: json object
*/
function getUserFields(fields) {

	/* wrap the ajax request in a promise */
	var promise = new Promise(function(resolve,reject) {
		var params = "fields=" + fields.join(",");

		/* create the url destination for the ajax request */
		var url = createURL("/getprofiledata");

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "err") {
						reject("err");
						} else if (xmlhttp.responseText === "noprofiledataloggedout") {
							reject("noprofiledataloggedout");
						} else {
							resolve(JSON.parse(xmlhttp.responseText));
						}
				} else {
					reject("err");
				}
			}
		};

		xmlhttp.send(params);
	});

	return promise;
}

/*
   Function: journalError

   This function is used to try and report frontend errors to the backend. Parameters are passed in by the browser's event listener.

   Parameters:

    	message - string, error message
		source - string, url of error
		lineno - string, line number of error
		colno - string, column number of error
		error - object, Error object

   Returns:

    	none - *
*/
function journalError(message,source,linenum,colnum,error) {

	var url = createURL("/journalerror");
	var params = "message=" + message + "&urlsource=" + source + "&linenum" + linenum;

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	if (xmlhttp.readyState === XMLHttpRequest.DONE) {
		if(xmlhttp.status === 200) {
			if(xmlhttp.responseText === "success") {
				// error reported
		} else {
			// error not reported
		}
	}
	xmlhttp.send(params);
   }
}

// <<<fold>>>

/* set window to report errors */
window.onerror = journalError;
