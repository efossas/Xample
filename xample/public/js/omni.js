/* eslint-env browser, es6 */
/*****
	Title: Omni
	This contains front-end functions that are pretty much used on all page-types. This should be added to other front-end js files with a bash script.
*****/

/* list any objects js dependencies */
/*
	global alertify:true
*/

/***
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

/*
   Function: autosaveTimer

   Display the autosave timer on the page.

   Parameters:

      div - html div, the div that will contain the timer
	  saveFunction - the function to call that saves.

   Returns:

      Nothing.
*/
function autosaveTimer(asdiv,saveFunction) {

	var promise = getUserFields(["autosave"]);

	promise.then(function(data) {
		var time = data.autosave;

		if(time !== 0) {
			var timer = time;
			var minutes;
			var seconds;
			setInterval(function() {
				minutes = parseInt(timer / 60,10);
				seconds = parseInt(timer % 60,10);

				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;

				asdiv.textContent = minutes + ":" + seconds;

				if (--timer < 0) {
					saveFunction();
					timer = time;
				}
			},1000);
		} else {
			asdiv.style.visibility = "hidden";
			asdiv.style.display = "none";
		}
	},function(error) {
		alertify.alert("Error. Auto Save Could Not Be Initiated.");
	});
}

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
		funcName - string/function, the function name to call with parameters
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
		submit.setAttribute('onclick',funcName + ';');
	} else {
		submit.onclick = funcName;
	}

	submit.innerHTML = text;

	return submit;
}

/*
	Function: dashAutoSave

	Creates the auto save display div.

	Parameters:

		none

	Returns:

		success - html node, auto save display.
*/
function dashAutoSave() {
	var autosave = document.createElement("div");
	autosave.setAttribute("id","autosave");

	return autosave;
}

/*
	Function: dashSaveStatus

	Creates the save status display div.

	Parameters:

		none

	Returns:

		success - html node, save status display
*/
function dashSaveStatus() {
	var savestatus = document.createElement("div");
	savestatus.setAttribute("id","savestatus");
	savestatus.innerHTML = "Saved";

	return savestatus;
}

/*
	Function: dashSaveProgress

	Create the progress display. Inside which is a <progress> tag.

	Parameters:

		none

	Returns:

		success - html node, progress display.
*/
function dashSaveProgress() {
	var saveprogress = document.createElement("div");
	saveprogress.setAttribute("id","saveprogress");

	var progressbar = document.createElement("progress");
	progressbar.setAttribute("id","progressbar");
	progressbar.setAttribute("value",100);
	progressbar.setAttribute("max",100);
	progressbar.style.visibility = 'hidden';
	progressbar.style.display = "none";

	saveprogress.appendChild(progressbar);

	return saveprogress;
}

/*
	Function: barMenu

	Creates the menu.

	Parameters:

		* - none

	Returns:

		success - html node, menu div
*/
function barMenu() {
	/* create top div for menu buttons */
	var menu = document.createElement("div");
	menu.setAttribute("class","menu-bar");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	/* explore button */
	var explore = btnLink('Explore',createURL('/'),'none');
	var colExplore = document.createElement("div");
	colExplore.setAttribute("class","col col-15");
	colExplore.appendChild(explore);

	/* home button */
	var home = btnLink('Home',createURL('/home'),'none');
	var colHome = document.createElement("div");
	colHome.setAttribute("class","col col-15");
	colHome.appendChild(home);

	/* profile button */
	var profile = btnLink('Profile',createURL('/profile'),'none');
	var colProfile = document.createElement("div");
	colProfile.setAttribute("class","col col-15");
	colProfile.appendChild(profile);

	/* log out button */
	var logout = btnSubmit('Log Out','logout()','none');
	var colLogOut = document.createElement("div");
	colLogOut.setAttribute("class","col col-15");
	colLogOut.appendChild(logout);

	/* empty */
	var colEmpty = document.createElement("div");
	colEmpty.setAttribute("class","col col-40");

	/* append buttons to row 1 */
	rowOne.appendChild(colExplore);
	rowOne.appendChild(colHome);
	rowOne.appendChild(colProfile);
	rowOne.appendChild(colEmpty);
	rowOne.appendChild(colLogOut);

	/* append row 1 to the menu */
	menu.appendChild(rowOne);

	return menu;
}

/*
	Function: barStatus

	Creates the status bar, which includes save information.

	Parameters:

		pid - the page id

	Returns:

		success - html node, status bar div
*/
function barStatus(pid) {
	/* create top div for menu buttons */
	var statusBar = document.createElement("div");
	statusBar.setAttribute("class","status-bar");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	/* revert button */
	var revert = btnSubmit('Revert',"revertBlocks()",'none');
	revert.className += " savebar";
	var colRevert = document.createElement("div");
	colRevert.setAttribute("class","col col-15");
	colRevert.appendChild(revert);

	/* save button */
	var save = btnSubmit("Save","saveBlocks(true)","none");
	save.className += " savebar";
	var colSave = document.createElement("div");
	colSave.setAttribute("class","col col-15");
	colSave.appendChild(save);

	/* save bar */
	var savebar = document.createElement("div");
	savebar.setAttribute("id","savebar");
	var colSaveBar = document.createElement("div");
	colSaveBar.setAttribute("class","col col-70");
	colSaveBar.appendChild(savebar);

	/* save progress bar div, save status div, & auto save timer div */
	var saveprogress = dashSaveProgress();
	var savestatus = dashSaveStatus();
	var autosave = dashAutoSave();

	/* wrap status and autosave in saveinfo div */
	var saveinfo = document.createElement("div");
	saveinfo.setAttribute("id","saveinfo");

	/* append status & autosave to other divs */
	saveinfo.appendChild(savestatus);
	saveprogress.appendChild(autosave);

	/* append save progress & save info divs to save bar */
	savebar.appendChild(saveprogress);
	savebar.appendChild(saveinfo);

	/* append everything to row */
	rowOne.appendChild(colRevert);
	rowOne.appendChild(colSaveBar);
	rowOne.appendChild(colSave);

	var pageid = document.createElement('input');
	pageid.setAttribute('type','hidden');
	pageid.setAttribute('name','pageid');
	pageid.setAttribute('value',pid);

	/* this is set to 0 after block adds and deletes & 1 after saves */
	/* it is checked when exiting a window to notify the user that the page hasn't been saved */
	var statusid = document.createElement('input');
	statusid.setAttribute('type','hidden');
	statusid.setAttribute('name','statusid');
	statusid.setAttribute('value','1');

	/* append hidden values to bar */
	statusBar.appendChild(pageid);
	statusBar.appendChild(statusid);

	/* append row to status bar */
	statusBar.appendChild(rowOne);

	return statusBar;
}

/*
	Function: progressFinalize

	Parameters:

		msg - string, for displaying what is being progressed
		max - int, the value representing a completed progress load

	Returns:

		none - *
*/
function progressFinalize(msg,max) {
	document.getElementById("progressbar").setAttribute("value",max);
	document.getElementById("progressbar").style.visibility = "hidden";
	document.getElementById("progressbar").style.display = "none";

	document.getElementById("autosave").style.visibility = "visible";
	document.getElementById("autosave").style.display = "block";

	document.getElementById("savestatus").innerHTML = msg;
}

/*
	Function: progressInitialize

	Parameters:

		msg - string, for displaying what is being progressed
		max - int, the value representing a completed progress load

	Returns:

		none - *
*/
function progressInitialize(msg,max) {
	document.getElementById("autosave").style.visibility = "hidden";
	document.getElementById("autosave").style.display = "none";

	document.getElementById("progressbar").setAttribute("value",0);
	document.getElementById("progressbar").setAttribute("max",max);
	document.getElementById("progressbar").style.visibility = "visible";
	document.getElementById("progressbar").style.display = "block";

	document.getElementById("savestatus").innerHTML = msg;
}

/*
	Function: progressUpdate

	Parameters:

		value - int, represent current progress

	Returns:

		none - *
*/
function progressUpdate(value) {
	document.getElementById("progressbar").setAttribute("value",value);
}

// <<<fold>>>

/***
	Section: Page Functions
	These are functions loading pages.
***/

// <<<code>>>

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

// <<<fold>>>

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
