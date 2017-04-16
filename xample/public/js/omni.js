/* eslint-env browser, es6 */
/*****
	Title: Omni
	This contains front-end functions that are pretty much used on all page-types. This should be added to other front-end js files with a bash script.
*****/

/* list any objects js dependencies */
/*
	global alertify:true
*/

var globalScope = {};

/***
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

function autoMatch(text,array) {
	/* split text by whitespace */
	var tarr = text.match(/\S+/g) || [];

	if(tarr.length < 1) return [];

	/* only autocomplete on last word & only match alphanumeric chars */
	var current = tarr[tarr.length - 1].replace(/\W/g,'');

	/* create regexp to match word */
	var re = new RegExp("\\b" + current + "\\S+","i");

	/* assemble any matches into an array */
	var matches = [];

	array.forEach(function(value,index) {
		if(re.test(value)) {
			matches.push(value);
		}
	});

	return matches;
}

function autoComplete(dropdiv,matches) {
	var list = "<ul>";
	matches.forEach(function(value) {
		list += "<li>" + value + "</li>";
	});
	list += "</ul>";

	emptyDiv(dropdiv);

	dropdiv.innerHTML = list;
}

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

	Detects local or remote host and constructs desired url. Make sure path contains leading forward slash "/".

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
		url = splitUrl[0] + "//" + splitUrl[2] + encodeURI(path);
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
	linkbtn.setAttribute('value',text);
	linkbtn.innerHTML = text;

	if(color !== 'inactive') {
		linkbtn.setAttribute('class','btn ' + color + '-btn');
	} else {
		linkbtn.setAttribute('class','btn ' + color + '-btn inactive');
	}

	if(url !== '') {
		linkbtn.setAttribute('href',url);
		linkbtn.setAttribute('target','_self');
	}

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
	submit.setAttribute('id',text.replace(' ','-'));
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
function dashAutoSave(engineID) {
	var autosave = document.createElement("div");
	autosave.setAttribute("id","bengine-autosave-" + engineID + "-");

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
function dashSaveStatus(engineID) {
	var savestatus = document.createElement("div");
	savestatus.setAttribute("id","bengine-savestatus-" + engineID + "-");
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
function dashSaveProgress(engineID) {
	var saveprogress = document.createElement("div");
	saveprogress.setAttribute("id","saveprogress");

	var progressbar = document.createElement("progress");
	progressbar.setAttribute("id","bengine-progressbar-" + engineID + "-");
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

	/* expand page settings div function */
	function expandSettings(div,closeArray) {
		closeArray.forEach(function(element) {
			element.setAttribute('style','display:none;visibility:hidden;');
			element.setAttribute('data-expanded','0');
		});
		if(div.getAttribute('data-expanded') === '0') {
			div.setAttribute('style','display:inline-block;visibility:visible;');
			div.setAttribute('data-expanded','1');
		} else {
			div.setAttribute('style','display:none;visibility:hidden;');
			div.setAttribute('data-expanded','0');
		}
	}

	/* about div */
	var aboutDiv = document.createElement('div');
	aboutDiv.setAttribute('id','section-about col-100');
	aboutDiv.setAttribute('class','section-about');
	aboutDiv.setAttribute('data-expanded','0');
	aboutDiv.setAttribute('style','display:none;visibility:hidden;');
	aboutDiv.innerHTML = pageinfo.blurb;

	/* embed div */
	var embedDiv = document.createElement('div');
	embedDiv.setAttribute('id','section-embed col-100');
	embedDiv.setAttribute('class','section-embed');
	embedDiv.setAttribute('data-expanded','0');
	embedDiv.setAttribute('style','display:none;visibility:hidden;');

	var embedInput = document.createElement('input');
	embedInput.setAttribute('class','text-input');
	embedInput.setAttribute('readonly','true');
	embedDiv.appendChild(embedInput);

	/* add iframe code to input & highlight it */
	var embedurl = createURL('/embed?a=' + pageinfo.aid + '&p=' + pageinfo.id);
	embedInput.value = `<div style="position:relative;height:0;overflow:hidden;padding-bottom:56.25%;"><iframe src="${embedurl}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>`;

	embedInput.onclick = function() {
		this.setSelectionRange(0,embedInput.value.length);
	};

	/* about button */
	var about = btnSubmit('About',function() { expandSettings(aboutDiv,[embedDiv]); },'none');
	var colAbout = document.createElement("div");
	colAbout.setAttribute("class","col col-15");
	colAbout.appendChild(about);

	/* embed button */
	var embed = btnSubmit('Embed',function() { expandSettings(embedDiv,[aboutDiv]); },'none');
	var colEmbed = document.createElement("div");
	colEmbed.setAttribute("class","col col-15");
	colEmbed.appendChild(embed);

	/* create views */
	var colViews = document.createElement('div');
	colViews.setAttribute('class','col col-25');

	var views = document.createElement('div');
	views.setAttribute('class','box-views-row');
	views.innerHTML = String(pageinfo.views) + " views";
	colViews.appendChild(views);

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
	bmark.setAttribute('title','Bookmark This Page');

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
	rowOne.appendChild(colEmbed);
	rowOne.appendChild(colSpace);
	rowOne.appendChild(colViews);
	rowOne.appendChild(colRating);
	rowOne.appendChild(colBookmark);

	/* append row 1 to the menu */
	info.appendChild(rowOne);
	info.appendChild(aboutDiv);
	info.appendChild(embedDiv);

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
function barStatus(pid,engineID) {
	/* create top div for menu buttons */
	var statusBar = document.createElement("div");
	statusBar.setAttribute("class","status-bar");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	/* revert button */
	var revert = btnSubmit('Revert',"wiseEngine.revertBlocks()",'none');
	revert.className += " savebarbtn";
	var colRevert = document.createElement("div");
	colRevert.setAttribute("class","col col-15");
	colRevert.appendChild(revert);

	/* save button */
	var save = btnSubmit("Save","wiseEngine.saveBlocks(true)","none");
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
	var saveprogress = dashSaveProgress(engineID);
	var savestatus = dashSaveStatus(engineID);
	var autosave = dashAutoSave(engineID);

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
	Function: barPageSettings

	Creates bar for changing page settings

	Parameters:

		pagetype - string, used for links
		aid - the author id
		settings - object, with settings as properties

	Returns:

		success - html node, dropdowns.
*/
function barPageSettings(pagetype,aid,settings,engineID) {
	var pageSettings = document.createElement('div');
	pageSettings.setAttribute('class','settings-bar col-100');

	/* show mode page link */
	var showLink = document.createElement('div');
	showLink.setAttribute('class','page-link');
	var slink = createURL('/' + pagetype + '?a=' + aid + '&p=' + settings.id);
	showLink.innerHTML = "<a href='" + slink + "' target='_blank'>" + slink + "</a>";
	pageSettings.appendChild(showLink);

	/* page title input */
	var title = document.createElement('input');
	title.setAttribute('type','text');
	title.setAttribute('name','pagename');
	title.setAttribute('id','pagetitle');
	title.setAttribute('class','page-title');
	title.setAttribute('maxlength','50');
	title.setAttribute('value',settings.name);
	pageSettings.appendChild(title);

	/* drop downs for choosing page subj,cat,top */
	var ddsct = formDropDownsSCT(settings.subject,settings.category,settings.topic);
	pageSettings.appendChild(ddsct);

	/* grab autocomplete if topic is already set */
	if(settings.topic !== "" && settings.topic !== null) {
		getTags(settings.subject,settings.category,settings.topic).then(function(data) {
			globalScope.tags = data;
		},function(err) {
			if(err === 'unset') {
				alertify.alert("Missing Subject Category Or Topic.");
			}
		});
	}

	/* div for tag input & autcomplete box */
	var tagAutoDiv = document.createElement('div');

	/* tag input */
	var tagInput = document.createElement('input');
	tagInput.setAttribute('id','page-tags');
	tagInput.setAttribute('class','text-input');
	tagInput.setAttribute('placeholder','enter comma-separated tags');
	var currentTags = "";
	if(settings.tagthree) {
		currentTags = [settings.tagone,settings.tagtwo,settings.tagthree].join();
	} else if(settings.tagtwo) {
		currentTags = [settings.tagone,settings.tagtwo].join();
	} else if(settings.tagone) {
		currentTags = settings.tagone;
	}
	tagInput.setAttribute('value',currentTags);
	tagInput.onkeyup = function(event) {
		addAutoComplete('tag-autocomplete-dropdown',tagInput,globalScope.tags);
	};

	/* prevent tab, up, down default behaviour */
	document.onkeydown = function(event) {
		if(event.keyCode === 9 || event.keyCode === 40 || event.keyCode === 38) {
			event.preventDefault();
		}
	};

	/* autcomplete box */
	var autoCompleteBox = document.createElement('div');
	autoCompleteBox.setAttribute('id','tag-autocomplete-dropdown');
	autoCompleteBox.setAttribute('class','autocomplete-dropdown');
	autoCompleteBox.setAttribute('style','display:none;visibility:hidden');

	/* append all tag & autocomplete stuff */
	tagAutoDiv.appendChild(tagInput);
	tagAutoDiv.appendChild(autoCompleteBox);

	pageSettings.appendChild(tagAutoDiv);

	/* row for image and blurb */
	var rowImgBlurb = document.createElement('div');
	rowImgBlurb.setAttribute('class','row');

	function uploadThumb() {
		/* get the hidden file-select object that will store the user's file selection */
		var fileSelect = document.getElementById('bengine-file-select-' + engineID + "-");
		fileSelect.setAttribute("accept",".bmp,.bmp2,.bmp3,.jpeg,.jpg,.pdf,.png,.svg");

		fileSelect.click();

		fileSelect.onchange = function() {
			/* grab the selected file */
			var file = fileSelect.files[0];

			var notvalid = false;
			var nofile = false;
			var errorMsg;
			if(fileSelect.files.length > 0) {
				if(file.size > 4294967295) {
					notvalid = true;
					errorMsg = "Files Must Be Less Than 4.3 GB";
				}
			} else {
				nofile = true;
			}

			if(nofile) {
				/* do nothing, no file selected */
			} else if(notvalid) {
				alertify.alert(errorMsg);
			} else {
				/* wrap the ajax request in a promise */
				var promise = new Promise(function(resolve,reject) {

					/* create javascript FormData object and append the file */
					var formData = new FormData();
					formData.append('media',file,file.name);

					/* get the directory id */
					var id = document.getElementById('bengine-x-id-' + engineID + "-").getAttribute('data-did');

					/* grab the domain and create the url destination for the ajax request */
					var url = createURL("/uploadthumb?id=" + id);

					var xmlhttp = new XMLHttpRequest();
					xmlhttp.open('POST',url,true);

					xmlhttp.onreadystatechange = function() {
						if (xmlhttp.readyState === XMLHttpRequest.DONE) {
							if(xmlhttp.status === 200) {
								var result = JSON.parse(xmlhttp.responseText);

								switch(result.msg) {
									case 'success':
										resolve(result.data); break;
									case 'nouploadloggedout':
										alertify.alert("You Can't Upload A Thumbnail Because You Are Logged Out. Log Back In On A Separate Page, Then Return Here & Try Again.");
										reject("err"); break;
									case 'convertmediaerr':
										reject('convertmediaerr'); break;
									case 'err':
									default:
										reject('err');
								}
							} else {
								alertify.alert('Error:' + xmlhttp.status + ": Please Try Again");
								reject("err");
							}
						}
					};

					xmlhttp.send(formData);
				});

				promise.then(function(imglink) {
					var linkparts = imglink.split(",");
					var thumbtag = document.getElementById('pageimg');
					thumbtag.src = linkparts[1];
				},function(error) {
					if(error === "convertmediaerr") {
						alertify.log("There was an error with that media format. Please try a different file type.");
					} else {
						alertify.log("There was an unknown error during thumbnail upload.");
					}
				});
			}
		};
	}

	/* page thumbnail img */
	var colImg = document.createElement('div');
	colImg.setAttribute('class','col col-26');

	var thumbContainer = document.createElement('div');
	thumbContainer.setAttribute('class','thumb-center');
	colImg.appendChild(thumbContainer);

	var thumbnail = document.createElement('img');
	thumbnail.setAttribute('id','pageimg');
	thumbnail.setAttribute('class','thumb-img');
	thumbnail.onclick = uploadThumb;
	if(settings.imageurl !== "") {
		thumbnail.setAttribute('src',settings.imageurl);
	}
	thumbContainer.appendChild(thumbnail);

	/* page blurb input */
	var colBlurb = document.createElement('div');
	colBlurb.setAttribute('class','col col-74');

	var blurb = document.createElement('textarea');
	blurb.setAttribute('name','pageblurb');
	blurb.setAttribute('id','pageblurb');
	blurb.setAttribute('class','page-blurb');
	blurb.setAttribute('rows','4');
	blurb.setAttribute('maxlength','500');
	blurb.setAttribute('placeholder','Explain this page here.');
	blurb.value = settings.blurb;
	colBlurb.appendChild(blurb);

	/* append img and blurb */
	rowImgBlurb.appendChild(colImg);
	rowImgBlurb.appendChild(colBlurb);
	pageSettings.appendChild(rowImgBlurb);

	/* page settings save */
	var capital = pagetype.charAt(0).toUpperCase() + pagetype.slice(1);
	var btnSaveSettings = btnSubmit('Save ' + capital + ' Settings','savePageSettings("' + pagetype + '","' + engineID + '")','green');
	pageSettings.appendChild(btnSaveSettings);

	return pageSettings;
}

function addAutoComplete(dropdownID,inputDiv,autoCompleteArray) {
	var dropdown = document.getElementById(dropdownID);
	if(autoCompleteArray) {
		var suggestions = [];
		if(dropdown.children.length > 0) {
			suggestions = dropdown.children[0].getElementsByTagName("li");
		}
		/* down key, up key, tab key, any other key */
		var selected;
		if(event.keyCode === 40 && suggestions.length > 0) {
			var i = 0;
			while (i < suggestions.length) {
				if(suggestions[i].className === 'ac-dd-selected') {
					selected = suggestions[i]; i++; break;
				}
				i++;
			}
			if(typeof selected === 'undefined') {
				suggestions[0].className = "ac-dd-selected";
			} else if (i < suggestions.length) {
				selected.className = "";
				selected.nextSibling.className = "ac-dd-selected";
			}
		} else if (event.keyCode === 38 && suggestions.length > 0) {
			for (var j = 0; j < suggestions.length; j++) {
				if(suggestions[j].className === 'ac-dd-selected') {
					selected = suggestions[j]; break;
				}
			}
			if(typeof selected !== 'undefined') {
				if (j === 0) {
					suggestions[0].className = "";
				} else {
					selected.className = "";
					selected.previousSibling.className = "ac-dd-selected";
				}
			}
		} else if ((event.keyCode === 9 || event.keyCode === 39 || event.keyCode === 13) && suggestions.length > 0) {
			for (let i = 0; i < suggestions.length; i++) {
				if(suggestions[i].className === 'ac-dd-selected') {
					inputDiv.value = inputDiv.value.replace(/\w+$/,"");
					inputDiv.value += suggestions[i].innerHTML;
					dropdown.style = "display:none;visibility:hidden";
					break;
				}
			}
		} else {
			var matches = autoMatch(inputDiv.value,autoCompleteArray);
			if(matches.length > 0) {
				autoComplete(dropdown,matches);
				dropdown.style = "display:block;visibility:visible";
			} else {
				dropdown.style = "display:none;visibility:hidden";
			}
		}
	} else if (this.value === "") {
		dropdown.style = "display:none;visibility:hidden";
	}
}

/*
	Function: formDropDownsSCT

	Creates the form for selecting Subject, Category, Topic.

	Parameters:

		defSub - string, default subject; leave empty otherwise
		defCat - string, default category; leave empty otherwise
		defTop - string, default topic; leave empty otherwise

	Returns:

		success - html node, dropdowns.
*/
function formDropDownsSCT(defSub,defCat,defTop) {
	/* used for making the default first selection grey in the dropdowns */
	function greyFirstSelect(selectTag) {
		if(selectTag.selectedIndex === 0) {
			selectTag.style = "color: grey";
		} else {
			selectTag.style = "color: black";
		}
	}

	/* this function will be called onchange of subject drop down */
	function loadCategories() {

		/* get the selected subject */
		var subject = this.options[this.selectedIndex].value;

		/* get & empty the category selection element */
		var listCategories = document.getElementById("select-category");
		emptyDiv(listCategories);

		/* create the default first selection */
		var optionCategory = document.createElement('option');
		optionCategory.setAttribute("value","");
		optionCategory.innerHTML = "choose category";
		listCategories.appendChild(optionCategory);

		/* get & empty the topic selection element */
		var listTopics = document.getElementById("select-topic");
		emptyDiv(listTopics);

		/* create the default first selection */
		var optionTopic = document.createElement('option');
		optionTopic.setAttribute("value","");
		optionTopic.innerHTML = "choose topic";
		listTopics.appendChild(optionTopic);

		if(subject !== "") {

			/* get the categories for that subject */
			var categories = Object.keys(globalScope.subjects[subject]);
			var count = categories.length;

			/* fill the selection element with categories */
			for(var i = 0; i < count; i++) {
				optionCategory = document.createElement('option');
				optionCategory.setAttribute('value',categories[i]);
				optionCategory.innerHTML = categories[i];
				listCategories.appendChild(optionCategory);
			}

			/* reset the selection to "choose category" */
			listCategories.selectedIndex = 0;
		}

		/* grey the first selected */
		greyFirstSelect(this);
		greyFirstSelect(listCategories);
		greyFirstSelect(listTopics);
	}

	/* this function will be called onchange of categories dropdown */
	function loadTopics() {

		/* get the selected category */
		var category = this.options[this.selectedIndex].value;

		/* get the selected subject using id */
		var selectSubject = document.getElementById("select-subject");
		var subject = selectSubject.options[selectSubject.selectedIndex].value;

		/* get & empty the topic selection element */
		var listTopics = document.getElementById("select-topic");
		emptyDiv(listTopics);

		/* create the default first option */
		var optionTopic = document.createElement('option');
		optionTopic.innerHTML = "choose topic";
		optionTopic.setAttribute("value","");
		listTopics.appendChild(optionTopic);

		/* just in case subject hasn't been selected */
		if(subject !== "" && category !== "") {

			/* get the topics for the category */
			var topics = globalScope.subjects[subject][category];
			var count = topics.length;

			/* fill the selection element with topics */
			for(var i = 0; i < count; i++) {
				optionTopic = document.createElement('option');
				optionTopic.setAttribute('value',topics[i]);
				optionTopic.innerHTML = topics[i];
				listTopics.appendChild(optionTopic);
			}

			/* reset the selection to "choose topic" */
			listTopics.selectedIndex = 0;
		}

		/* grey the first selected */
		greyFirstSelect(this);
		greyFirstSelect(listTopics);
	}

	var row_SubjectSelect = document.createElement("div");
	row_SubjectSelect.setAttribute("class","row");

	var colLeft_SubjectSelect = document.createElement("div");
	colLeft_SubjectSelect.setAttribute("class","col col-33");

	var colMiddle_SubjectSelect = document.createElement("div");
	colMiddle_SubjectSelect.setAttribute("class","col col-33");

	var colRight_SubjectSelect = document.createElement("div");
	colRight_SubjectSelect.setAttribute("class","col col-33");

	row_SubjectSelect.appendChild(colLeft_SubjectSelect);
	row_SubjectSelect.appendChild(colMiddle_SubjectSelect);
	row_SubjectSelect.appendChild(colRight_SubjectSelect);

	/* create select tags */
	var listSubjects = document.createElement('select');
	listSubjects.setAttribute("id","select-subject");
	listSubjects.onchange = loadCategories;
	listSubjects.style = "color: grey";

	var listCategories = document.createElement('select');
	listCategories.setAttribute("id","select-category");
	listCategories.onchange = loadTopics;
	listCategories.style = "color: grey";

	var listTopics = document.createElement('select');
	listTopics.setAttribute("id","select-topic");
	listTopics.onchange = function() {
		greyFirstSelect(listTopics);

		var ss = document.getElementById('select-subject');
		var sc = document.getElementById('select-category');
		var st = document.getElementById('select-topic');

		/* don't get tags if changed to default empty first child in dropdown */
		if(st.options[st.selectedIndex].value !== "") {
			getTags(ss.options[ss.selectedIndex].value,sc.options[sc.selectedIndex].value,st.options[st.selectedIndex].value).then(function(data) {
				globalScope.tags = data;
			},function(err) {
				if(err === 'unset') {
					alertify.alert("Missing Subject Category Or Topic.");
				}
			});
		}
	};
	listTopics.style = "color: grey";

	/* get subjects for select topic list */
	var subjectsPromise = getSubjects();

	subjectsPromise.then(function(data) {
		var subjectsData = data;
		globalScope.subjects = subjectsData;

		/* first box - subject names */
		var subjectsNames = Object.keys(subjectsData);
		var subjectsCount = subjectsNames.length;

		var optionSubject = document.createElement('option');
		optionSubject.innerHTML = "choose subject";
		optionSubject.setAttribute("value","");
		listSubjects.appendChild(optionSubject);

		/* loop through and add subjects. */
		var foundSubject = false;
		for(var i = 0; i < subjectsCount; i++) {
			optionSubject = document.createElement('option');
			optionSubject.setAttribute('value',subjectsNames[i]);
			optionSubject.innerHTML = subjectsNames[i];
			listSubjects.appendChild(optionSubject);
			if(subjectsNames[i] === defSub) {
				optionSubject.setAttribute('selected','selected');
				foundSubject = true;
			}
		}

		/* second box - category names */
		var optionCategory = document.createElement('option');
		optionCategory.setAttribute("value","");
		optionCategory.innerHTML = "choose category";
		listCategories.appendChild(optionCategory);

		/* add categories if this page has saved subject */
		var foundCategory = false;
		if(foundSubject) {
			/* get the categories for that subject */
			var categories = Object.keys(globalScope.subjects[defSub]);
			var countCat = categories.length;

			/* fill the selection element with categories */
			for(var j = 0; j < countCat; j++) {
				optionCategory = document.createElement('option');
				optionCategory.setAttribute('value',categories[j]);
				optionCategory.innerHTML = categories[j];
				listCategories.appendChild(optionCategory);
				if(categories[j] === defCat) {
					optionCategory.setAttribute('selected','selected');
					foundCategory = true;
				}
			}
		}

		/* third box - topic names */
		var optionTopic = document.createElement('option');
		optionTopic.setAttribute("value","");
		optionTopic.innerHTML = "choose topic";
		listTopics.appendChild(optionTopic);

		/* add topics if this page has saved category */
		if(foundCategory) {
			/* get the topics for the category */
			var topics = globalScope.subjects[defSub][defCat];
			var countTop = topics.length;

			/* fill the selection element with topics */
			for(var k = 0; k < countTop; k++) {
				optionTopic = document.createElement('option');
				optionTopic.setAttribute('value',topics[k]);
				optionTopic.innerHTML = topics[k];
				listTopics.appendChild(optionTopic);
				if(topics[k] === defTop) {
					optionTopic.setAttribute('selected','selected');
				}
			}

		}

	},function(error) {
		alertify.alert("There Was An Error Getting The Subjects");
	});

	/* append lists to columns */
	colLeft_SubjectSelect.appendChild(listSubjects);
	colMiddle_SubjectSelect.appendChild(listCategories);
	colRight_SubjectSelect.appendChild(listTopics);

	return row_SubjectSelect;
}

/*
	Function: savePageSettings

	This function makes an ajax request to save the page settings.

	Parameters:

		pagetype - string, type of page being saved

	Returns:

		none
*/
var savePageSettings = function(pagetype,engineID) {
	/* create the url destination for the ajax request */
	var url = createURL('/savepagesettings');

	/* get the pid & page name */
	var id = document.getElementById('bengine-x-id-' + engineID + "-").getAttribute('data-xid');
	var title = document.getElementById('pagetitle').value;
	var subject = document.getElementById('select-subject').value;
	var category = document.getElementById('select-category').value;
	var topic = document.getElementById('select-topic').value;
	var tags = document.getElementById('page-tags').value;
	var imageurl = document.getElementById('pageimg').src.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	var blurb = document.getElementById('pageblurb').value;

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "pt=" + pagetype + "&id=" + id + "&p=" + title + "&s=" + subject + "&c=" + category + "&t=" + topic + "&tags=" + encodeURIComponent(tags) + "&i=" + imageurl + "&b=" + blurb;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'settingssaved':
						alertify.log("Settings Saved!","success"); break;
					case 'nosaveloggedout':
						alertify.alert("Save Settings Error. You Are Not Logged In."); break;
					case 'nosubjectnotsaved':
						alertify.alert("Save Settings Error. Please Enter At Least A Subject."); break;
					case 'invalidtags':
						alertify.alert("Save Settings Error. Non-Existing Tag Entered."); break;
					case 'excesstags':
						alertify.alert("Save Settings Error. A Maximum Of 3 Tags Is Allowed."); break;
					case 'err':
					default:
						alertify.alert("An Error Occured. Please Try Again Later");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
		}
	};

	xmlhttp.send(params);
};

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
	if(main === null) {
		main = document.getElementById('content-embed');
	}
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
	Function: getTags

	This function retrieves json with tags for a subjects,categories,topics.

	Parameters:

		subject - string,
		category - string,
		topic - string,

	Returns:

		success - promise
*/
function getTags(subject,category,topic) {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/gettags");

		var params = "s=" + subject + "&c=" + category + "&t=" + topic;

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
						case 'unset':
							reject('unset'); break;
						default:
							reject('unknown');
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send(params);
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
