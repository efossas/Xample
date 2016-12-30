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
		url = splitUrl[0] + "//" + splitUrl[2] + encodeURI(path);
	} else {
		url = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + encodeURI(path);
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

/*
	Function: formSignUp

	Create a sign up form. This returns an html node containing the form. On submit, the form calls signup()

	Parameters:

		none

	Form:

		username-signup - the user name
		email-signup - the user's email
		phone-signup - the user's phone
		password-signup - the password
		password-signup-check - the password again

	Returns:

		success - html node, sign up form
*/
function formSignUp() {

	/* create parent <div> */
	var signup = document.createElement('div');
	signup.setAttribute('class','form');
	signup.setAttribute('id','form-signup');

	/* username column */
	var colUsername = document.createElement('div');
	colUsername.setAttribute('class','col col-21');

	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('class','log-input');
	username.setAttribute('type','text');
	username.setAttribute('name','username-signup');
	username.setAttribute('maxlength','50');
	username.setAttribute('placeholder','User Name');
	username.setAttribute('style','border-left-width:0px;');
	colUsername.appendChild(username);

	/* email column */
	var colEmail = document.createElement('div');
	colEmail.setAttribute('class','col col-30');

	/* create email text <input> */
	var email = document.createElement('input');
	email.setAttribute('class','log-input');
	email.setAttribute('type','text');
	email.setAttribute('name','email-signup');
	email.setAttribute('maxlength','50');
	email.setAttribute('placeholder','Email');
	colEmail.appendChild(email);

	/* password column */
	var colPassword = document.createElement('div');
	colPassword.setAttribute('class','col col-17');

	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('class','log-input');
	password.setAttribute('type','password');
	password.setAttribute('name','password-signup');
	password.setAttribute('maxlength','32');
	password.setAttribute('placeholder','Password');
	colPassword.appendChild(password);

	/* password check column */
	var colPasswordc = document.createElement('div');
	colPasswordc.setAttribute('class','col col-17');

	/* create another password <input> */
	var passwordc = document.createElement('input');
	passwordc.setAttribute('class','log-input');
	passwordc.setAttribute('type','password');
	passwordc.setAttribute('name','password-signup-check');
	passwordc.setAttribute('maxlength','32');
	passwordc.setAttribute('placeholder','Repeat Password');
	colPasswordc.appendChild(passwordc);

	/* submit button column */
	var colSubmit = document.createElement('div');
	colSubmit.setAttribute('class','col col-15');

	/* create form submit <button> */
	var submit = btnSubmit('Sign Up','signup()','green');
	submit.setAttribute('value','submit-signup');
	submit.setAttribute('style','border-color:black;border-left-width:1px;');
	colSubmit.appendChild(submit);

	/* append the elements to the parent <div> */
	signup.appendChild(colUsername);
	signup.appendChild(colEmail);
	signup.appendChild(colPassword);
	signup.appendChild(colPasswordc);
	signup.appendChild(colSubmit);

	return signup;
}

/*
	Function: expandRow

	This is only used on the explore page now, after much frustration, a dynamic function could not be attached to the boxes. This could be altered for functionality elsewhere though so it's not such a waste of space.

	Parameters:

		btn - object, the button being clicked

	Returns:

		nothing - *
*/
function expandRow(btn) {
	var extraInfo = btn.parentNode.parentNode.parentNode.parentNode.children[1];
	if(extraInfo.style.visibility === 'visible') {
		extraInfo.style = "display:none;visibility:hidden;";
	} else {
		extraInfo.style = "display:block;visibility:visible;";
	}
}

/*
	Function: getCookies

	Grabs the cookies on this site & returns an object for them. Important, all values must be JSON.

	Parameters:

		none

	Returns:

		nothing - *
*/
function getCookies() {
	var userObj = {};
	var userdata = decodeURIComponent(document.cookie).split('; ');

	userdata.forEach(function(elem) {
		var parts = elem.split('=');
		try {
			userObj[parts[0]] = JSON.parse(parts[1].substring(2));
		} catch(e) {
			// discard
		}
	});
	console.log(userObj);
	return userObj;
}

/*
	Function: toggleCheck

	This is used to toggle a checkbtn (view class in styles) between check and not checked.

	Parameters:

		btn - object, the button being clicked

	Returns:

		nothing - *
*/
function toggleCheck(btn) {
	if(btn.getAttribute('data-checked') === 'true') {
		btn.setAttribute('data-checked','false');
		btn.style["color"] = "black";
		btn.style["background-color"] = "buttonface";
	} else {
		btn.setAttribute('data-checked','true');
		btn.style["color"] = "white";
		btn.style["background-color"] = "blue";
	}
}

/*
	Function: watermark

	Generates a watermark div. Append anywhere and it works.

	Parameters:

		none

	Returns:

		object - html node
*/
function watermark() {
	var wm = document.createElement('div');
	wm.setAttribute('id','watermark');
	wm.innerHTML = 'Wisepool';

	return wm;
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
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'loggedout':
						window.location = createURL("/"); break;
					case 'err':
					default:
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
	linkbtn.setAttribute('target','_self');
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
	Function: barLog

	Creates the log in & sign up form.

	Parameters:

		* - none

	Returns:

		success - html node, log in sign up div
*/
function barLog() {

	/* create parent <div> */
	var logBar = document.createElement('div');
	logBar.setAttribute('class','log-bar');
	logBar.setAttribute('id','form-login');

	/* create top row */
	var rowTop = document.createElement('div');
	rowTop.setAttribute('class','row');
	rowTop.setAttribute('id','top-bar');

	function expandLog() {
		/* create empty col */
		var colEmptyLog = document.createElement('div');
		colEmptyLog.setAttribute('class','col col-50');

		/* create username column */
		var colUsername = document.createElement('div');
		colUsername.setAttribute('class','col col-20');

		/* create username text <input> */
		var username = document.createElement('input');
		username.setAttribute('class','log-input');
		username.setAttribute('type','text');
		username.setAttribute('name','username-login');
		username.setAttribute('maxlength','50');
		username.setAttribute('placeholder','User Name');
		username.setAttribute('style','border-left-width:2px;');

		colUsername.appendChild(username);

		/* create password column */
		var colPassword = document.createElement('div');
		colPassword.setAttribute('class','col col-20');

		/* create password <input> */
		var password = document.createElement('input');
		password.setAttribute('class','log-input');
		password.setAttribute('type','password');
		password.setAttribute('name','password-login');
		password.setAttribute('maxlength','32');
		password.setAttribute('placeholder','Password');

		colPassword.appendChild(password);

		/* create submit button column */
		var colSubmit = document.createElement('div');
		colSubmit.setAttribute('class','col col-10');

		/* create form submit <button> */
		var submit = btnSubmit('Log In','login()','green');
		submit.setAttribute('style','border-color:black;border-left-width:1px;');

		colSubmit.appendChild(submit);

		emptyDiv(rowTop);
		rowTop.appendChild(colEmptyLog);
		rowTop.appendChild(colUsername);
		rowTop.appendChild(colPassword);
		rowTop.appendChild(colSubmit);
	}

	function expandSign() {
		var sign = formSignUp();

		emptyDiv(rowTop);
		rowTop.appendChild(sign);
	}

	/* create expand buttons */
	var explore = btnLink('Explore',createURL('/'),'none');
	var logBtn = btnSubmit('Log In',expandLog,'none');
	var signBtn = btnSubmit('Sign Up',expandSign,'none');

	/* create columns */
	var colExplore = document.createElement("div");
	colExplore.setAttribute("class","col col-15");
	colExplore.appendChild(explore);

	var colEmpty = document.createElement('div');
	colEmpty.setAttribute('class','col col-55');

	var colLogBtn = document.createElement('div');
	colLogBtn.setAttribute('class','col col-15');
	colLogBtn.appendChild(logBtn);

	var colSignBtn = document.createElement('div');
	colSignBtn.setAttribute('class','col col-15');
	colSignBtn.appendChild(signBtn);

	/* add columns to top row */
	rowTop.appendChild(colExplore);
	rowTop.appendChild(colEmpty);
	rowTop.appendChild(colLogBtn);
	rowTop.appendChild(colSignBtn);

	/* append the elements to the parent <div> */
	logBar.appendChild(rowTop);

	return logBar;
}

/*
	Function: barInfo

	Creates the sub bar for page info.

	Parameters:

		* - none

	Returns:

		success - html node, menu div
*/
function barInfo(pagetype,pageinfo) {
	/* get user cookies for bookmarks */
	var userObj = getCookies();

	/* create top div for info */
	var info = document.createElement("div");
	info.setAttribute("class","info-bar");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	/* about button */
	var about = btnSubmit('About','','none');
	var colAbout = document.createElement("div");
	colAbout.setAttribute("class","col col-15");
	colAbout.appendChild(about);

	/* share button */
	var share = btnSubmit('Share','','none');
	var colShare = document.createElement("div");
	colShare.setAttribute("class","col col-15");
	colShare.appendChild(share);

	/* create views */
	var colViews = document.createElement('div');
	colViews.setAttribute('class','col col-15');

	var views = document.createElement('div');
	views.setAttribute('class','box-views-row');
	views.innerHTML = String(pageinfo.views) + " views";
	colViews.appendChild(views);

	/* rank it */
	var rankit = document.createElement('div');
	rankit.setAttribute('class','box-rankit');

	var starOne = document.createElement('input');
	starOne.setAttribute('type','checkbox');
	starOne.setAttribute('class','star');

	var starTwo = document.createElement('input');
	starTwo.setAttribute('type','checkbox');
	starTwo.setAttribute('class','star');

	var starThree = document.createElement('input');
	starThree.setAttribute('type','checkbox');
	starThree.setAttribute('class','star');

	rankit.appendChild(starOne);
	rankit.appendChild(starTwo);
	rankit.appendChild(starThree);

	var colRankit = document.createElement('div');
	colRankit.setAttribute('class','col col-10');
	colRankit.appendChild(rankit);

	/* create rating */
	var colRating = document.createElement('div');
	colRating.setAttribute('class','col col-15');

	var rating = document.createElement('div');
	rating.setAttribute('class','box-rating');
	colRating.appendChild(rating);

	var ratingBar = document.createElement('div');
	ratingBar.setAttribute('class','rating-bar');
	ratingBar.setAttribute('role','progressbar');
	rating.appendChild(ratingBar);

	/* bookmark */
	var bookmark = document.createElement('div');
	bookmark.setAttribute('class','box-bookmark');

	var bmark = document.createElement('input');
	bmark.setAttribute('type','checkbox');
	bmark.setAttribute('class','bmark');
	bmark.setAttribute('data-aid',pageinfo.aid);
	bmark.setAttribute('data-pid',pageinfo.id);
	bmark.setAttribute('data-pagetype',pagetype);

	if(userObj.hasOwnProperty('bm')) {
		if(userObj.bm.hasOwnProperty(pagetype)) {
			if(userObj.bm[pagetype].hasOwnProperty(pageinfo.aid)) {
				if(userObj.bm[pagetype][pageinfo.aid].indexOf(pageinfo.id) > -1) {
					bmark.setAttribute('checked','true');
				}
			}
		}
	}

	bmark.addEventListener('change',setBookmark);
	bookmark.appendChild(bmark);

	var colBookmark = document.createElement('div');
	colBookmark.setAttribute('class','col col-4');
	colBookmark.appendChild(bookmark);

	/* space column */
	var colSpace = document.createElement('div');
	colSpace.setAttribute('class','col col-26');

	/* append columns to row */
	rowOne.appendChild(colAbout);
	rowOne.appendChild(colShare);
	rowOne.appendChild(colSpace);
	rowOne.appendChild(colViews);
	rowOne.appendChild(colRankit);
	rowOne.appendChild(colRating);
	rowOne.appendChild(colBookmark);

	/* append row 1 to the menu */
	info.appendChild(rowOne);

	return info;
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
	Function: barSubMenu

	Creates a sub menu with a single button that when clicked, will expand a provided div.

	Parameters:

		button name - string, name of button that expands div.
		settings div - html div, contains div that will be revealed

	Returns:

		success - html node, menu div
*/
function barSubMenu(btnName,settingsDiv) {
	/* set necessary attributes for settingsDiv */
	settingsDiv.setAttribute('id','page-settings');
	settingsDiv.setAttribute('data-expanded','0');
	settingsDiv.setAttribute('style','display:none;visibility:hidden;');

	/* create top div for menu buttons */
	var menu = document.createElement("div");
	menu.setAttribute("class","submenu-bar");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	/* expand page settings div function */
	function expandSettings() {
		if(settingsDiv.getAttribute('data-expanded') === '0') {
			settingsDiv.setAttribute('style','display:inline-block;visibility:visible;');
			settingsDiv.setAttribute('data-expanded','1');
		} else {
			settingsDiv.setAttribute('style','display:none;visibility:hidden;');
			settingsDiv.setAttribute('data-expanded','0');
		}
	}

	/* page settings button */
	var settings = btnSubmit(btnName,expandSettings,'none');
	var colSettings = document.createElement("div");
	colSettings.setAttribute("class","col col-100");
	colSettings.appendChild(settings);

	/* append buttons to row 1 */
	rowOne.appendChild(colSettings);

	/* append row 1 to the menu */
	menu.appendChild(rowOne);
	menu.appendChild(settingsDiv);

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
	revert.className += " savebarbtn";
	var colRevert = document.createElement("div");
	colRevert.setAttribute("class","col col-15");
	colRevert.appendChild(revert);

	/* save button */
	var save = btnSubmit("Save","saveBlocks(true)","none");
	save.className += " savebarbtn";
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

		error - string, message to display user.

	Returns:

		nothing - *
*/
function pageError(error) {
	var errorMessage = document.createElement("div");
	errorMessage.setAttribute('class','errmsg');
	errorMessage.innerHTML = '<h2>Error</h2><br><p>' + error + '</p>';

	var main = document.getElementById('content');
	emptyDiv(main);
	main.appendChild(errorMessage);
}

// <<<fold>>>

/***
	Section: Ajax Functions
	These are functions to retrieve data from the back-end.
***/

// <<<code>>>

/*
	Function: getSubjects

	This function retrieves json with subjects,categories,topics.

	Parameters:

		none

	Returns:

		success - promise
*/
function getSubjects() {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getsubjects");

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					var result = JSON.parse(xmlhttp.responseText);

					switch(result.msg) {
						case 'success':
							resolve(result.data); break;
						case 'err':
							reject('err'); break;
						default:
							reject('unknown');
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send();
	});

	return promise;
}

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
					var result = JSON.parse(xmlhttp.responseText);

					switch(result.msg) {
						case 'success':
							resolve(result.data.profiledata); break;
						case 'noprofiledataloggedout':
							reject('noprofiledataloggedout'); break;
						case 'err':
						default:
							reject('err');
					}
				} else {
					reject('err');
				}
			}
		};

		xmlhttp.send(params);
	});

	return promise;
}

function setBookmark() {
	var action;
	var message;
	if(this.checked) {
		action = 'create';
		message = 'Saved';
	} else {
		action = 'delete';
		message = 'Deleted';
	}

	var params = "action=" + action + "&aid=" + this.getAttribute('data-aid') + "&pid=" + this.getAttribute('data-pid') + "&pagetype=" + this.getAttribute('data-pagetype');

	/* create the url destination for the ajax request */
	var url = createURL("/setbookmark");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'success':
						alertify.log("Bookmark " + message + "!","success"); break;
					case 'nocreateloggedout':
						alertify.alert("You Are Logged Out. Please Log In To Save Bookmarks."); break;
					case 'err':
					default:
						alertify.log("Error. Bookmark Not Saved.","error"); break;
				}
			} else {
				alertify.log("Error. Bookmark Not Saved.","error");
			}
		}
	};

	xmlhttp.send(params);
}

function setView(pagetype,aid,xid) {
	var params = "pagetype=" + pagetype + "&aid=" + aid + "&xid=" + xid;

	/* create the url destination for the ajax request */
	var url = createURL("/sv");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				// ignore result
			} else {
				alertify.log("Error. Bookmark Not Saved.","error");
			}
		}
	};

	xmlhttp.send(params);
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

	// no reason to check anything, this is the end of the line

	xmlhttp.send(params);
}

// <<<fold>>>

/* set window to report errors */
window.onerror = journalError;
