/* eslint-env browser, es6 */
/*
	Title: Navigation
	This is the front-end for Xample Block Pages

	Topic: Important Terms

		Block ID - Blocks are just <div> tags with the attribute id=""
		Block Type - Blocks are given the attribute class="". Used to insert the correct html into the block <div>
		Block Content - The actual content of the block (not the html). This could be text, image link, etc.
		Block Count - The number of blocks currently on the page. Used a lot for inserting or changing block id's.
		Page Table - Pages are stored in the database as p_uid_pid, where uid = user id & pid = page id.

	Topic: Important Divs

		content - This class is a div that holds all of the content of the page. Known as the "main div"
		blocks - This class holds all of the page blocks.

*/

/*****
	Title: Navigation
	This is the front-end for Xample general pages.
*****/

/***
	Section: Globals
	These are the global variables xample uses

	globalScope - attach needed global variables as properties to this object
***/

// <<<code>>>

var globalScope = {};

/* list any functions that will be joined to this file here from omni */
/*
	global createURL:true
	global emptyDiv:true
	global btnLink:true
	global btnSubmit:true
	global getUserFields:true
	global barMenu:true
*/

/* list any objects from other js files here */
/*
	global alertify:true
*/

// <<<fold>>>

/***
	Section: Helper Functions
	These are helper functions.
***/

/***
	Section: Display Functions
	These are functions to create, remove, or show page elements.
***/

// <<<code>>>

/*
	Function: formLogin

	Create a log in form. This returns an html node containing the form. On submit, the form calls login()

	Parameters:

		none

	Form:

		username-login - the user name
		password-login - the password

	Returns:

		success - html node, log in form
*/
function formLogin() {

	/* create parent <div> */
	var login = document.createElement('div');
	login.setAttribute('class','form');
	login.setAttribute('id','form-login');

	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('type','text');
	username.setAttribute('name','username-login');
	username.setAttribute('maxlength','50');
	username.setAttribute('placeholder','User Name');

	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('type','password');
	password.setAttribute('name','password-login');
	password.setAttribute('maxlength','32');
	password.setAttribute('placeholder','Password');

	/* create form submit <button> */
	var submit = document.createElement('button');
	submit.setAttribute('type','button');
	submit.setAttribute('name','submit-login');
	submit.setAttribute('onclick','login();');
	submit.innerHTML = "Log In";

	/* append the elements to the parent <div> */
	login.appendChild(username);
	login.appendChild(password);
	login.appendChild(submit);

	return login;
}

/*
	Function: formGenerateUserContent

	Make a user content form.

	Parameters:

		type - string, the name of the type of content page to create.

	Returns:

		success - html node, user content creation form
*/
function formGenerateUserContent(type,data) {
	var capital;
	var lower;
	var deleteFunc;
	if(type === 'blockpage') {
		capital = 'Page';
		lower = 'page';
		deleteFunc = deletePage;
	} else if(type === 'lg') {
		capital = 'LG';
		lower = 'lg';
		deleteFunc = deleteLG;
	}

	var row_Content = document.createElement("div");
	row_Content.setAttribute("class","row");

	var colLeft_Content = document.createElement("div");
	colLeft_Content.setAttribute("class","col col-85");

	var colRight_Content = document.createElement("div");
	colRight_Content.setAttribute("class","col col-15");

	row_Content.appendChild(colLeft_Content);
	row_Content.appendChild(colRight_Content);

	/* input element is for page name */
	var title = document.createElement('input');
	title.setAttribute('type','text');
	title.setAttribute('class','text-input');
	title.setAttribute('name',lower + 'name-create');
	title.setAttribute('maxlength','50');
	title.setAttribute('placeholder',capital + ' Name');

	/* submit button that calls createpage() */
	var submit = btnSubmit("Create " + capital,"create" + lower + "()","green");

	/* append elements to row */
	colLeft_Content.appendChild(title);
	colRight_Content.appendChild(submit);

	/* get the page data from comma-separated string */
	var dataarray = data.split(',');

	/* row 3 */
	var row_dataBox = document.createElement("div");
	row_dataBox.setAttribute("class","row");

	var colMiddle_dataBox = document.createElement("div");
	colMiddle_dataBox.setAttribute("class","col col-100");

	/* create a div to hold the page links */
	var datadiv = document.createElement('div');
	datadiv.setAttribute('class',lower + 'list');

	/* append elements to row 3 */
	row_dataBox.appendChild(datadiv);

	/* create select multiple box for page names */
	var selectBox = document.createElement('select');
	selectBox.setAttribute('multiple','true');
	selectBox.setAttribute('id',lower + '-select');

	/* append elements to datadiv */
	datadiv.appendChild(selectBox);

	/* get number of pages, each page has two data (link,name), so 1 is empty */
	var count;
	if(dataarray.length === 1) {
		count = 0;
	} else {
		count = dataarray.length / 2;
	}

	/* create page links and append to data div */
	var i = 0;
	while(count > 0) {
		var option = document.createElement('option');
		option.setAttribute('value',dataarray[i]);
		option.innerHTML = dataarray[i + 1];
		selectBox.appendChild(option);

		i += 2;
		count--;
	}

	/* row 4 */
	var row_dataSubmitButtons = document.createElement("div");
	row_dataSubmitButtons.setAttribute("class","row");

	var colLeft_dataSubmitButtons = document.createElement("div");
	colLeft_dataSubmitButtons.setAttribute("class","col col-80");

	var colRight_dataSubmitButtons = document.createElement("div");
	colRight_dataSubmitButtons.setAttribute("class","col col-20");

	row_dataSubmitButtons.appendChild(colLeft_dataSubmitButtons);
	row_dataSubmitButtons.appendChild(colRight_dataSubmitButtons);

	/* this function is called when a block page link is clicked on */
	function goToPage() {
		var selectBox = document.getElementById(lower + "-select");
		var dataop = selectBox.value;

		if(dataop === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			var link = createURL("/edit" + lower + "?" + lower + "=" + dataop);
			window.open(link,"_self");
		}
	}

	/* create submit button for go to page */
	var goToPageBtn = btnSubmit("Go To " + capital,goToPage,"green");

	/* this function is called to double check deleting a block page */
	function deletePageConfirm() {
		var selectBox = document.getElementById(lower + "-select");
		var datapage = selectBox.value;

		if(datapage === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			alertify.confirm("Are You Sure You Want To Delete This? This Is Permanent.",function(accepted) {
				if (accepted) {
					deleteFunc(datapage);
				} else {
					// user clicked "cancel"
				}
			});
		}
	}

	/* create delete page button */
	var deletePageBtn = btnSubmit("Delete " + capital,deletePageConfirm,"red");

	/* append elements to row 4 */
	colLeft_dataSubmitButtons.appendChild(goToPageBtn);
	colRight_dataSubmitButtons.appendChild(deletePageBtn);

	/* append the page links to a form div */
	var generateUserContentDiv = document.createElement('div');
	generateUserContentDiv.setAttribute('class','page-gen');
	generateUserContentDiv.setAttribute('id',type + '-gen');
	generateUserContentDiv.appendChild(row_Content);
	generateUserContentDiv.appendChild(row_dataBox);
	generateUserContentDiv.appendChild(row_dataSubmitButtons);

	return generateUserContentDiv;
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

	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('type','text');
	username.setAttribute('name','username-signup');
	username.setAttribute('maxlength','50');
	username.setAttribute('placeholder','User Name');

	/* create email text <input> */
	var email = document.createElement('input');
	email.setAttribute('type','text');
	email.setAttribute('name','email-signup');
	email.setAttribute('maxlength','50');
	email.setAttribute('placeholder','Email - optional');

	/* create phone text <input> */
	var phone = document.createElement('input');
	phone.setAttribute('type','text');
	phone.setAttribute('name','phone-signup');
	phone.setAttribute('maxlength','15');
	phone.setAttribute('placeholder','Phone - optional');

	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('type','password');
	password.setAttribute('name','password-signup');
	password.setAttribute('maxlength','32');
	password.setAttribute('placeholder','Password');

	/* create another password <input> */
	var passwordc = document.createElement('input');
	passwordc.setAttribute('type','password');
	passwordc.setAttribute('name','password-signup-check');
	passwordc.setAttribute('maxlength','32');
	passwordc.setAttribute('placeholder','Repeat Password');

	/* create form submit <button> */
	var submit = document.createElement('button');
	submit.setAttribute('type','button');
	submit.setAttribute('value','submit-signup');
	submit.setAttribute('onclick','signup();');
	submit.innerHTML = "Sign Up";

	/* create error <div> for displaying errors */
	var error = document.createElement('div');
	error.setAttribute('class','error');
	error.setAttribute('id','error-signup');

	/* append the elements to the parent <div> */
	signup.appendChild(username);
	signup.appendChild(email);
	signup.appendChild(phone);
	signup.appendChild(password);
	signup.appendChild(passwordc);
	signup.appendChild(submit);
	signup.appendChild(error);

	return signup;
}

/*
	Function: rowProfileCheck

	Creates a profile row div when input must be validated (like chaning a password, requires entering current & new password). The back end must have a check for accepting the check and field names. Probably in the route function that saves profile data.

	Parameters:

		check - string, the name of the field to validate
		field - string, the name of the new data field
		placeholders - an array with two strings, first the placeholder text for check, second for field
		description - string, short description shown on the left of input tag

	Returns:

		success - html node, profile row div
*/
function rowProfileCheck(check,field,placeholders,description) {
	var row = document.createElement("div");
	row.setAttribute("class","row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-15");

	var colMiddleLeft = document.createElement("div");
	colMiddleLeft.setAttribute("class","col col-35 pad-10-left");

	var colMiddleRight = document.createElement("div");
	colMiddleRight.setAttribute("class","col col-35 pad-10-right");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-15");

	/* first input */
	var first = document.createElement('input');
	first.setAttribute('type','password');
	first.setAttribute('name',check);
	first.setAttribute('class','text-input');
	first.setAttribute('maxlength','50');
	first.setAttribute('placeholder',placeholders[0]);

	/* second input */
	var second = document.createElement('input');
	second.setAttribute('type','password');
	second.setAttribute('name',field);
	second.setAttribute('class','text-input');
	second.setAttribute('maxlength','50');
	second.setAttribute('placeholder',placeholders[1]);

	/* save btn */
	var saveBtn = document.createElement('button');
	saveBtn.setAttribute('type','button');
	saveBtn.setAttribute('name','save-' + field);
	saveBtn.setAttribute('class','menubtn green-btn');
	saveBtn.setAttribute('onclick','saveProfileInfo(this,["' + check + '","' + field + '"])');
	saveBtn.innerHTML = "Save";

	colLeft.innerHTML = description;
	colMiddleLeft.appendChild(first);
	colMiddleRight.appendChild(second);
	colRight.appendChild(saveBtn);

	row.appendChild(colLeft);
	row.appendChild(colMiddleLeft);
	row.appendChild(colMiddleRight);
	row.appendChild(colRight);

	return row;
}

/*
	Function: rowProfileSingle

	Creates a profile row div.

	Parameters:

		field - string, the name of the field, must match the column name in MySQL database
		description - string, short description shown on the left of input tag
		data - the current profile data for that field, will populate the input tag

	Returns:

		success - html node, profile row div
*/
function rowProfileSingle(field,description,data) {

	var row = document.createElement("div");
	row.setAttribute("class","row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-15");

	var colMiddle = document.createElement("div");
	colMiddle.setAttribute("class","col col-70 pad-10");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-15");

	/* username input */
	var fieldInput = document.createElement('input');
	fieldInput.setAttribute('type','text');
	fieldInput.setAttribute('name',field);
	fieldInput.setAttribute('class','text-input');
	fieldInput.setAttribute('maxlength','50');
	fieldInput.setAttribute('value',data);

	/* save username btn */
	var saveBtn = document.createElement('button');
	saveBtn.setAttribute('type','button');
	saveBtn.setAttribute('name','save-' + field);
	saveBtn.setAttribute('class','menubtn green-btn');
	saveBtn.setAttribute('onclick','saveProfileInfo(this,["' + field + '"])');
	saveBtn.innerHTML = "Save";

	colLeft.innerHTML = description;
	colMiddle.appendChild(fieldInput);
	colRight.appendChild(saveBtn);

	row.appendChild(colLeft);
	row.appendChild(colMiddle);
	row.appendChild(colRight);

	return row;
}

// <<<fold>>>

/***
	Section: Page Functions
	These are functions for displaying full pages. They are commonly called by the back-end.
***/

// <<<code>>>

/*
	Function: pageHome

	Displays the Home Page (index page for logged in users). Currently displays log out button, makes and shows page creation form, and fetches and links to existing user pages.

	Parameters:

		none

	Returns:

		nothing - *
*/
function pageHome() {

	var menu = barMenu();

	/* append the form to the main div */
	var main = document.getElementById('content');
	main.appendChild(menu);

	main.appendChild(document.createElement('hr')); /// remove this later, when you style

	/* fetch user pages */
	var promiseBP = getPages();

	/* fetch user learning guides */
	var promiseLG = getLearningGuides();

	Promise.all([promiseBP,promiseLG]).then(function(values) {
		/* block page create form */
		var row_PageCreate = formGenerateUserContent('blockpage',values[0]);
		main.appendChild(row_PageCreate);

		main.appendChild(document.createElement('hr')); /// remove this later, when you style

		/* learning guide create form */
		var row_LgCreate = formGenerateUserContent('lg',values[1]);
		main.appendChild(row_LgCreate);
	},function(error) {
		console.log(error);
	});
}

/*
	Function: pageLanding

	Dispaly the landing page. The logstatus is used purely for displaying a login/signup form vs a link to the home page. Do not use it to display any sensitive data.

	Parameters:

		logstatus - boolean, true if logged in or false otherwise.

	Returns:

		nothing - *
*/
function pageLanding(logstatus) {

	var main = document.getElementById('content');

	/* create and append menu based on log status */
	if(logstatus === true) {
		var menu = barMenu();
	} else {
		var login = formLogin();

		/* this function will reveal the sign up form onclick */
		function displaySignUp() {
			document.getElementById('logdisplay').removeChild(document.getElementById('signupbtn'));
			document.getElementById('logdisplay').appendChild(formSignUp());
		}

		var signupbtn = document.createElement('button');
		signupbtn.setAttribute('type','button');
		signupbtn.setAttribute('id','signupbtn');
		signupbtn.onclick = displaySignUp;
		signupbtn.innerHTML = "Sign Up";

		var menu = document.createElement('div');
		menu.appendChild(login);
		menu.appendChild(document.createElement('hr')); /// remove this later, when you style
		menu.appendChild(signupbtn);
	}
	main.appendChild(menu);

	var next = document.createElement('div');
	next.setAttribute('class','explore');
	next.innerHTML = "add stuff here";

	/* append div to main */
	main.appendChild(document.createElement('hr'));
	main.appendChild(next);
}

/*
	Function: pageProfile

	This function displays a user's profile page.

	Parameters:

		profiledata - the user's profile data

	Returns:

		nothing - *
*/
function pageProfile(profiledata) {

	/// if profiledata == "err" handle this
	/// if profiledata == "noprofileloggedout" handle this
	if(profiledata === "err") {
		console.log("profile error");
	} else if (profiledata === "noprofileloggedout") {
		console.log("profile logged out");
	}

	var profileinfo = JSON.parse(profiledata);

	/* MENU */

	/* create menu */
	var menu = barMenu();

	/* PROFILE */

	/* create a div to hold the page links */
	var profilediv = document.createElement('div');
	profilediv.setAttribute('class','profilelist');

	/* make mandatory profile rows */
	var row_Username = rowProfileSingle("username","Username:",profileinfo.username);
	var row_Password = rowProfileCheck("currentPass","newPass",["Current Password","New Password"],"Password:");
	var row_Autosave = rowProfileSingle("autosave","Auto Save:",profileinfo.autosave);
	var row_DefaultText = rowProfileSingle("defaulttext","Default Text:",profileinfo.defaulttext);

	/* make recovery profile rows */
	var row_Email = rowProfileSingle("email","Email:",profileinfo.email);
	var row_Phone = rowProfileSingle("phone","Phone:",profileinfo.phone);

	/* make optional profile rows */

	/* append rows to profilediv */
	profilediv.appendChild(row_Username);
	profilediv.appendChild(row_Password);
	profilediv.appendChild(row_Autosave);
	profilediv.appendChild(row_DefaultText);
	profilediv.appendChild(row_Email);
	profilediv.appendChild(row_Phone);

	/* MAIN */

	/* grab the main div and append all of these elements */
	var main = document.getElementById('content');
	main.appendChild(menu);
	main.appendChild(document.createElement('hr')); /// REMOVE THIS AFTER STYLING
	main.appendChild(profilediv);
}

// <<<fold>>>

/***
	Section: AJAX Functions
	These functions send ajax requests
***/

// <<<code>>>

/*
	Function: login

	This function logs a user in.

	Parameters:

		none

	Returns:

		nothing - *
*/
function login() {

	/* create the url destination for the ajax request */
	var url = createURL("/login");

	/* get the entered username and password */
	var username = document.getElementsByName('username-login')[0].value;
	var password = document.getElementsByName('password-login')[0].value;

	/// instant validation needed

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "username=" + username + "&password=" + password;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "loggedin") {
					window.location = createURL("/home");
				} else if(xmlhttp.responseText === "incorrect") {
					alertify.alert("The Passowrd Was Incorrect");
				} else if(xmlhttp.responseText === "notfound") {
					alertify.alert("The Username Could Not Be Found");
				} else {
					alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

/*
	Function: signup

	This function signs a user up.

	Parameters:

		none

	Returns:

		nothing - *
*/
function signup() {

	/* create the url destination for the ajax request */
	var url = createURL("/signup");

	/* get the user information */
	var username = document.getElementsByName('username-signup')[0].value;
	var email = document.getElementsByName('email-signup')[0].value;
	var phone = document.getElementsByName('phone-signup')[0].value;
	var password = document.getElementsByName('password-signup')[0].value;
	var passwordcheck = document.getElementsByName('password-signup-check')[0].value;

	/// todo: instant validation needed
	if(password !== passwordcheck) {
		/// oh fuck
	}

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "username=" + username + "&email=" + email + "&phone=" + phone + "&password=" + password;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					window.location = createURL("/home");
				} else if(xmlhttp.responseText === "exists") {
					alertify.alert("That Username Already Exists.\nPlease Choose A Different One.");
				} else {
					alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

/*
	Function: createlg

	This function creates a user learning guide.

	Parameters:

		none

	Returns:

		nothing - *
*/
function createlg() {

	/* create the url destination for the ajax request */
	var url = createURL("/createlg");

	/* get the page name */
	var guidename = document.getElementsByName('lgname-create')[0].value;

	if(guidename === "") {
		alertify.alert("Please Enter A Guide Name.");
	} else {
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		var params = "guidename=" + guidename;

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "pageexists") {
						alertify.alert("You Already Have A Guide With That Name.");
					} else if (xmlhttp.responseText === "nocreateloggedout") {
						alertify.alert("Unable To Create Page. You Are Logged Out.");
					} else if (xmlhttp.responseText === "err") {
						alertify.alert("An Error Occured. Please Try Again Later.");
					} else {
						window.location = createURL("/editlg?lg=" + xmlhttp.responseText);
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send(params);
	}
}

/*
	Function: createpage

	This function creates a user page.

	Parameters:

		none

	Returns:

		nothing - *
*/
function createpage() {

	/* create the url destination for the ajax request */
	var url = createURL("/createpage");

	/* get the page name */
	var pagename = document.getElementsByName('pagename-create')[0].value;

	if(pagename === "") {
		alertify.alert("Please Enter A Page Name.");
	} else {
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		var params = "pagename=" + pagename;

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "pageexists") {
						alertify.alert("You Already Have A Page With That Name.");
					} else if (xmlhttp.responseText === "nocreateloggedout") {
						alertify.alert("Unable To Create Page. You Are Logged Out.");
					} else if (xmlhttp.responseText === "err") {
						alertify.alert("An Error Occured. Please Try Again Later.");
					} else {
						window.location = createURL("/editpage?page=" + xmlhttp.responseText);
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send(params);
	}
}

/*
	Function: deleteLG

	This function deletes the selected user learning guide.

	Parameters:

		gid - guide id

	Returns:

		none - *
*/
function deleteLG(gid) {
	/* create the url destination for the ajax request */
	var url = createURL("/deletelg");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "gid=" + gid;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					var selectBox = document.getElementById('lg-select');
					var count = selectBox.length;
					var optionToRemove;
					for(var i = 0; i < count; i++) {
						if(selectBox.options[i].value === gid) {
							optionToRemove = selectBox.options[i];
						}
					}
					selectBox.removeChild(optionToRemove);
				} else if(xmlhttp.responseText === "nodeleteloggedout") {
					alertify.alert("Could Not Delete Guide. You Are Logged Out.");
				} else {
					alertify.alert("There Was A Problem Deleting The Guide.");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
		}
	};

	xmlhttp.send(params);
}

/*
	Function: deletePage

	This function deletes the selected user block page.

	Parameters:

		pid - page id

	Returns:

		none - *
*/
function deletePage(pid) {
	/* create the url destination for the ajax request */
	var url = createURL("/deletepage");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "pid=" + pid;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					var selectBox = document.getElementById('page-select');
					var count = selectBox.length;
					var optionToRemove;
					for(var i = 0; i < count; i++) {
						if(selectBox.options[i].value === pid) {
							optionToRemove = selectBox.options[i];
						}
					}
					selectBox.removeChild(optionToRemove);
				} else if(xmlhttp.responseText === "nodeleteloggedout") {
					alertify.alert("Could Not Delete Page. You Are Logged Out.");
				} else {
					alertify.alert("There Was A Problem Deleting The Page.");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
		}
	};

	xmlhttp.send(params);
}

/*
	Function: getLearningGuides

	This function fetches a user's learning guides. It returns a promise containing learning guide data in the following format (lid,lgname,)

	Parameters:

		none

	Returns:

		success - promise, pagedata
*/
function getLearningGuides() {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getlgs");

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "err") {
						reject("err");
					} else {
						resolve(xmlhttp.responseText);
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
	Function: getPages

	This function fetches a user's pages. It returns a promise containing page data in the following format (pid,pagename,)

	Parameters:

		none

	Returns:

		success - promise, pagedata
*/
function getPages() {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getpages");

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "err") {
						reject("err");
					} else {
						resolve(xmlhttp.responseText);
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
	Function: saveProfileInfo

	This function save profile data on the profile page.

	Parameters:

		btn - the button tag that was clicked. should be passed in with 'this' keyword.
		fields - an array of field parameters which should match the 'name' field of the input holding the data.

	Returns:

		nothing - *
*/
function saveProfileInfo(btn,fields) {

	var params = "";
	var i = 0;
	var count = fields.length;

	if(count > 0) {
		params = fields[i] + "=" + document.getElementsByName(fields[i])[0].value;
		i++;
	}
	while(i < count) {
		params += "&" + fields[i] + "=" + document.getElementsByName(fields[i])[0].value;
		i++;
	}

	/* create the url destination for the ajax request */
	var url = createURL("/saveprofile");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "profilesaved") {
						btn.style = "background-color: #00ffe1";
						alertify.log("Saved!","success");
					} else if (xmlhttp.responseText === "nosaveloggedout") {
						btn.style = "background-color: #e83e3e";
						alertify.alert("You Can't Save Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again.");
					} else {
						btn.style = "background-color: #e83e3e";
						alertify.alert("An Unknown Error Occurred");
					}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

// <<<fold>>>
