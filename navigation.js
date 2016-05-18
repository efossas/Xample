/*
	Title: Navigation
	This is the front-end for Xample
	
	Topic: Important Terms
	
		Block ID - Blocks are just <div> tags with the attribute id=""
		Block Type - Blocks are given the attribute class="". This is also used to insert the correct html into the block <div>
		Block Content - The actual content of the block (not the html). This could be text, image link, etc.
		Block Count - The number of blocks currently on the page. Used a lot for inserting or changing block id's.
		Page Table - Pages are stored in the database as p_uid_pid, where uid = user id & pid = page id.
		
	Topic: Important Divs
	
		content - This class is a div that holds all of the content of the page, nothing - * other than scripts goes outside of it. It is referred to as the "main div".
		blocks - This class holds all of the page blocks.
		
*/

/*
	Section: Globals
	These are the global variables xample uses
	
	domain - the domain name, including the http://
	pdfObjects - pdf.js generates pdf objects that can be used to render individual pages to <canvas>
*/

var domain = "http://abaganon.com/";
var pdfObjects = {};

/*
	Section: Display Functions
	These are functions to remove or show page elements (except for blocks).
*/

/*
	Function: emptyDiv
	
	Find a div by id and remove its contents.
	
	Parameters:
	
		divId - The id of the div whose contents will be removed
		
	Returns:
	
		nothing - *
*/
function emptyDiv(divId) {
	
	var node = document.getElementById(divId);
	
	while (node.hasChildNodes()) {
    	node.removeChild(node.lastChild);
	}
}

/*
	Function: loginForm
	
	Create a log in form. This returns an html node containing the form. On submit, the form calls login()
	
	Parameters:
	
		none
	
	Form:
	
		username-login - the user name
		password-login - the password
		
	Returns:
	
		success - html node, log in form
*/
function loginForm() {
	
	/* create parent <div> */
	var login = document.createElement('div');
	login.setAttribute('class', 'form');
	login.setAttribute('id', 'form-login');
	
	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('type', 'text');
	username.setAttribute('name', 'username-login');
	username.setAttribute('maxlength', '50');
	username.setAttribute('placeholder', 'User Name');

	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('type', 'password');
	password.setAttribute('name', 'password-login');
	password.setAttribute('maxlength', '32');
	password.setAttribute('placeholder', 'Password');
	
	/* create form submit <button> */
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('name', 'submit-login');
	submit.setAttribute('onclick', 'login();');
	submit.innerHTML = "Log In";
	
	/* append the elements to the parent <div> */
	login.appendChild(username);
	login.appendChild(password);
	login.appendChild(submit);
	
	return login;
}

/*
	Function: signupForm
	
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
function signupForm() {
	
	/* create parent <div> */
	var signup = document.createElement('div');
	signup.setAttribute('class', 'form');
	signup.setAttribute('id', 'form-signup');
	
	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('type', 'text');
	username.setAttribute('name', 'username-signup');
	username.setAttribute('maxlength', '50');
	username.setAttribute('placeholder', 'User Name');
	
	/* create email text <input> */
	var email = document.createElement('input');
	email.setAttribute('type', 'text');
	email.setAttribute('name', 'email-signup');
	email.setAttribute('maxlength', '50');
	email.setAttribute('placeholder', 'Email - optional');
	
	/* create phone text <input> */
	var phone = document.createElement('input');
	phone.setAttribute('type', 'text');
	phone.setAttribute('name', 'phone-signup');
	phone.setAttribute('maxlength', '15');
	phone.setAttribute('placeholder', 'Phone - optional');
	
	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('type', 'password');
	password.setAttribute('name', 'password-signup');
	password.setAttribute('maxlength', '32');
	password.setAttribute('placeholder', 'Password');
	
	/* create another password <input> */
	var passwordc = document.createElement('input');
	passwordc.setAttribute('type', 'password');
	passwordc.setAttribute('name', 'password-signup-check');
	passwordc.setAttribute('maxlength', '32');
	passwordc.setAttribute('placeholder', 'Repeat Password');
	
	/* create form submit <button> */
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('value', 'submit-signup');
	submit.setAttribute('onclick', 'signup();');
	submit.innerHTML = "Sign Up";
	
	/* create error <div> for displaying errors */
	var error = document.createElement('div');
	error.setAttribute('class', 'error');
	error.setAttribute('id', 'error-signup');
	
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
	Function: displaySignUp
	
	Handles displaying the sign up form.
	
	Parameters:
	
		none
		
	Returns:
	
		nothing - *
*/
function displaySignUp() {
	var signup = signupForm();
	
	var main = document.getElementById('content');
	main.appendChild(signup);
	main.removeChild(document.getElementById('signupbtn'));
}

/*
	Function: logoutBtn
	
	Creates a logout button.
	
	Parameters:
	
		none
		
	Returns:
	
		success - html node, logout button
*/
function logoutBtn() {
	var logout = document.createElement('button');
	logout.setAttribute('type', 'button');
	logout.setAttribute('class', 'menubtn logout-btn');
	logout.setAttribute('value', 'submit-logout');
	logout.setAttribute('onclick', 'logout();');
	logout.innerHTML = "Log Out";
	
	return logout;
}

/*
	Function: profileBtn
	
	Creates a profile button.
	
	Parameters:
	
		none
		
	Returns:
	
		success - html node, profile button
*/
function profileBtn() {
	var profile = document.createElement('button');
	profile.setAttribute('type', 'button');
	profile.setAttribute('class', 'menubtn profile-btn');
	profile.setAttribute('value', 'submit-profile');
	profile.setAttribute('onclick', 'profile();');
	profile.innerHTML = "Profile";
	
	return profile;
}

/*
	Function: displayLanding
	
	Displays the Landing Page (index page for logged out users). Currently creates a log in form and button to display sign up form. Then both are appended to the main div.
	
	Parameters:
	
		none
		
	Returns:
	
		nothing - *
*/
function displayLanding() {
	var login = loginForm();
	
	var signupbtn = document.createElement('button');
	signupbtn.setAttribute('type', 'button');
	signupbtn.setAttribute('id', 'signupbtn');
	signupbtn.setAttribute('onclick', 'displaySignUp();');
	signupbtn.innerHTML = "Sign Up";
	
	var main = document.getElementById('content');
	main.appendChild(login);
	main.appendChild(document.createElement('hr')); // remove this later, when you style
	main.appendChild(signupbtn);
}

/*
	Function: displayHome
	
	Displays the Home Page (index page for logged in users). Currently displays log out button, makes and shows page creation form, and fetches and links to existing user pages.
	
	Parameters:
	
		none
		
	Returns:
	
		nothing - *
*/
function displayHome() {
	
	/* get a log out button */
	var logout = logoutBtn();
	
	/* create a form for page creation */
	var header = document.createElement('div');
	header.setAttribute('class', 'form');
	header.setAttribute('id', 'form-header');
	
	/* input element is for page name */
	var title = document.createElement('input');
	title.setAttribute('type', 'text');
	title.setAttribute('name', 'pagename-create');
	title.setAttribute('maxlength', '50');
	title.setAttribute('placeholder', 'Page Name');
	
	/* submit button that calls createpage() */
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('value', 'submit-createpage');
	submit.setAttribute('onclick', 'createpage();');
	submit.innerHTML = "Create Page";
	
	/* append the log out button and form elements to form div */
	header.appendChild(logout);
	header.appendChild(title);
	header.appendChild(submit);
	
	/* append the form to the main div */
	var main = document.getElementById('content');
	main.appendChild(logout);
	main.appendChild(header);
	
	/* fetch user pages */
	var promise = getPages();
	
	promise.then(function(pages) {
		/* get the page data from comma-separated string */
		var pagearray = pages.split(',');
		
		/* create a div to hold the page links */
		var pagesdiv = document.createElement('div');
		pagesdiv.setAttribute('class', 'pagelist');
		
		/* get number of pages, each page has two data (link,name), so 1 is empty */
		if(pagearray.length === 1) {
			count = 0;
		} else {
			var count = pagearray.length / 2;
		}
		
		/* create page links and append to pages div */
		var i = 0;
		while(count > 0)
		{
			var link = document.createElement('a');
			link.setAttribute('class', 'pagelink');
			link.setAttribute('href', 'editpage?page=' + pagearray[i]);
			link.setAttribute('target', '_blank');
			link.innerHTML = pagearray[i+1];
			pagesdiv.appendChild(link);
			
			i += 2;
			count--;
		}
		
		/* append the page links to the main div */
		main.appendChild(document.createElement('hr')); // remove this later, when you style
		main.appendChild(pagesdiv);
		
	}, function(error) {
		console.log("getPages promise error");
	});
}

/*
	Function: editPage
	
	This function loads page data in edit mode.
	
	Parameters:
	
		pagedata - page data is received in the format "pid,pagename,(mediaType,mediaContent,)"
		
	Returns:
	
		nothing - *
*/
function editPage(pagedata) {
	
	/* MENU */
	
	/* create top div to wrap all header elements */
	var menu = document.createElement("div");
	menu.setAttribute("class", "block-menu");
	
	/* row 1 */
	var row_one = document.createElement("div");
	row_one.setAttribute("class", "row");
	
	var col_one_left = document.createElement("div");
	col_one_left.setAttribute("class", "col-15");
	
	var col_one_middle = document.createElement("div");
	col_one_middle.setAttribute("class", "col-70");
	
	var col_one_right = document.createElement("div");
	col_one_right.setAttribute("class", "col-15");
	
	row_one.appendChild(col_one_left);
	row_one.appendChild(col_one_middle);
	row_one.appendChild(col_one_right);
	
	/* log out button */
	var logout = logoutBtn();
	
	/* profile button */
	var profile = profileBtn();
	
	/* block array -> pid,pagename,mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray = pagedata.split(',');
	
	/* hidden pid & title */
	pid = blockarray[0];
	pagename = blockarray[1];
	
	var pageid = document.createElement('input');
	pageid.setAttribute('type', 'hidden');
	pageid.setAttribute('name', 'pageid');
	pageid.setAttribute('value', pid);
	
	var statusid = document.createElement('input');
	statusid.setAttribute('type', 'hidden');
	statusid.setAttribute('name', 'statusid');
	statusid.setAttribute('value', '1');
	
	/* append elements to row 1 */
	col_one_left.appendChild(logout);
	col_one_right.appendChild(profile);
	
	/* append row 1 to the menu */
	menu.appendChild(pageid);
	menu.appendChild(statusid);
	menu.appendChild(row_one);
	
	/* row 2 */
	var row_two = document.createElement("div");
	row_two.setAttribute("class", "row");
	
	var col_two_left = document.createElement("div");
	col_two_left.setAttribute("class", "col-15");
	
	var col_two_middle = document.createElement("div");
	col_two_middle.setAttribute("class", "col-70");
	
	var col_two_right = document.createElement("div");
	col_two_right.setAttribute("class", "col-15");
	
	row_two.appendChild(col_two_left);
	row_two.appendChild(col_two_middle);
	row_two.appendChild(col_two_right);
	
	/* revert btn */
	var revertbtn = document.createElement('button');
	revertbtn.setAttribute('type', 'button');
	revertbtn.setAttribute('name', 'revert-blocks');
	revertbtn.setAttribute('class', 'menubtn revert-btn');
	revertbtn.setAttribute('onclick', 'revertBlocks()');
	revertbtn.innerHTML = "Revert";
	
	/* page title input */
	var title = document.createElement('input');
	title.setAttribute('type', 'text');
	title.setAttribute('name', 'pagename');
	title.setAttribute('class', 'page-title');
	title.setAttribute('maxlength', '50');
	title.setAttribute('value', pagename);
	
	/* save btn */
	var savebtn = document.createElement('button');
	savebtn.setAttribute('type', 'button');
	savebtn.setAttribute('name', 'save-blocks');
	savebtn.setAttribute('class', 'menubtn save-btn');
	savebtn.setAttribute('onclick', 'saveBlocks(true)');
	savebtn.innerHTML = "Save";
		
	/* append elements to row 2 */
	col_two_left.appendChild(revertbtn);
	col_two_middle.appendChild(title);
	col_two_right.appendChild(savebtn);
	
	/* append row 2 to the menu */
	menu.appendChild(row_two);
	
	/* BLOCKS */
	
	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class', 'blocks');
	blocksdiv.setAttribute('id', 'blocks');
	
	/* initial first block buttons */
	var buttons = blockButtons(0);
	blocksdiv.appendChild(buttons);
	
	var count = 2;
	var i = 1;
	
	while(count < blockarray.length)
	{
		/* create the block */
		var block = generateBlock(i,blockarray[count]);
		block = insertContent(block,blockarray[count],blockarray[count+1]);
		
		/* create the block buttons */
		var buttons = blockButtons(i);
		
		/* create block + button div */
		var group = document.createElement('div');
		group.setAttribute('class', 'block');
		group.setAttribute('id', i);
		
		group.appendChild(block);
		group.appendChild(buttons);

		/* append group to blocks div */
		blocksdiv.appendChild(group);
		
		count += 2;
		i++;
	}
	
	/* HIDDEN FILE FORM */
	
	/* hidden form for media uploads */
	var fileinput = document.createElement('input');
	fileinput.setAttribute('type', 'file');
	fileinput.setAttribute('id', 'file-select');
	
	var filebtn = document.createElement('button');
	filebtn.setAttribute('type', 'submit');
	filebtn.setAttribute('id', 'upload-button');
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/uploadmedia";
	
	var fileform = document.createElement('form');
	fileform.setAttribute('id', 'file-form');
	fileform.setAttribute('action', url);
	fileform.setAttribute('method', 'POST');
	fileform.style.visibility = 'hidden';
	
	fileform.appendChild(fileinput);
	fileform.appendChild(filebtn);

	/* MAIN */

	/* grab the main div and append all of these elements */
	var main = document.getElementById('content');
	main.appendChild(menu);
	main.appendChild(blocksdiv);
	main.appendChild(fileform);
	
	/* AFTER STUFF */
	
	/* make delete buttons visible & last button invisible */
	var i = 0;
	blockCount = countBlocks();
	while(i < blockCount)
	{
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
	document.getElementById('d' + i).style.visibility = 'hidden';	
	
	/* turn all text blocks designMode to on */
	var textblocks = document.getElementsByClassName('xTex');
	var cntT = textblocks.length;
	for (i = 0; i < cntT; i++) {
		textblocks[i].contentDocument.designMode = "on";
	}
	
	/* render any code blocks */
	var codeblocks = document.getElementsByTagName('code');
	var cntC = codeblocks.length;
	for (i = 0; i < cntC; i++) {
		renderCode(codeblocks[i]);
	}
	
	/* render any math blocks */
	var mathblocks = document.getElementsByClassName('xmath');
	var cntM = mathblocks.length;
	for (i = 0; i < cntM; i++) {
		insertMath(mathblocks[i]);
	}
	
	/* render any latex blocks */
	var latexblocks = document.getElementsByClassName('latex');
	var cntL = latexblocks.length;
	for (i = 0; i < cntL; i++) {
		insertLatex(latexblocks[i]);
	}
	
	/* prevent user from exiting page if Revert or Save has not been clicked */
	window.onbeforeunload = function() {
		var status = document.getElementsByName("statusid")[0].value;
		if(status == 0) {
	    	return "Please click Revert or Save before exiting.";
	    }
	    return null;
	};
}

/*
	Function: choosePage
	
	This function loads the choose page display. A user is given the option to either load their last permanent save or their last temporary save.
	
	Parameters:
	
		pid - the page id
		
	Returns:
	
		nothing - *
*/
function choosePage(pid) {

	/* row 1 */
	var row_one = document.createElement("div");
	row_one.setAttribute("class", "row");
	
	var col_middle = document.createElement("div");
	col_middle.setAttribute("class", "col-100");
	
	var center_paragraph = document.createElement("p");
	center_paragraph.innerHTML = "You are viewing this because the page was closed without Revert or Save being clicked. Please choose which page you want to save.";
	
	col_middle.appendChild(center_paragraph);
	row_one.appendChild(col_middle);

	/* row 2 */
	var row_two = document.createElement("div");
	row_two.setAttribute("class", "row");
	
	var col_left = document.createElement("div");
	col_left.setAttribute("class", "col-50");
	
	var col_right = document.createElement("div");
	col_right.setAttribute("class", "col-50");
	
	row_two.appendChild(col_left);
	row_two.appendChild(col_right);
	
	var left_paragraph = document.createElement("p");
	left_paragraph.innerHTML = "This is your last temporary save. This save contains the blocks from the last time you added a block.";
	
	var tempBtn = document.createElement('button');
	tempBtn.setAttribute('type', 'button');
	tempBtn.setAttribute('class', 'menubtn temp-btn');
	tempBtn.setAttribute('value', 'submit-temp');
	tempBtn.setAttribute('onclick', 'loadTempPage(' + pid + ');');
	tempBtn.innerHTML = "Temporary Page";
	
	var right_paragraph = document.createElement("p");
	right_paragraph.innerHTML = "This is you last permanent save. This save contains the blocks from the last time you clicked Save.";
	
	var permBtn = document.createElement('button');
	permBtn.setAttribute('type', 'button');
	permBtn.setAttribute('class', 'menubtn perm-btn');
	permBtn.setAttribute('value', 'submit-perm');
	permBtn.setAttribute('onclick', 'loadPermPage(' + pid + ');');
	permBtn.innerHTML = "Permanent Page";
	
	col_left.appendChild(tempBtn);
	col_left.appendChild(left_paragraph);
	col_right.appendChild(permBtn);
	col_right.appendChild(right_paragraph);
	
	/* main */
	var main = document.getElementById("content");
	main.appendChild(row_one);
	main.appendChild(row_two);
}

/*
	Function: loadTempPage
	
	This function loads the user's temporary page.
	
	Parameters:
	
		pid - the page id
		
	Returns:
	
		nothing - *
*/
function loadTempPage(pid) {
	window.location = domain + "xample/editpage?page=" + pid + "&temp=true";
}

/*
	Function: loadPermPage
	
	This function loads the user's permanent page.
	
	Parameters:
	
		pid - the page id
		
	Returns:
	
		nothing - *
*/
function loadPermPage(pid) {
	window.location = domain + "xample/editpage?page=" + pid + "&temp=false";
}

/*
	Section: Block Functions
	These are functions handle the block generator
*/

/*
	Function: countBlocks
	
	Counts the blocks on the page.
	
	Parameters:
	
		none
		
	Returns:
	
		success - number, block count
*/
function countBlocks() {

	/* block IDs are just numbers, so count the number of IDs */
	var num = 0;
	var miss = true;
	while (miss == true)
	{
		num++;
		
		/* undefined is double banged to false, and node is double banged to true */
		miss = !!document.getElementById(num);
	}

	/* decrement num, since the check for id happens after increment */
	return --num;
}

/*
	Function: generateBlock
	
	Creates a content block with the given block type and block id provided.
	
	Parameters:
	
		bid - the block id
		btype - the block type
		
	Returns:
	
		success - html node, block
*/
function generateBlock(bid,btype) {
	var block = document.createElement('div');
	block.setAttribute('class',btype);
	block.setAttribute('id','a' + bid);
	
	return block;
}

/*
	Function: insertContent
	
	Takes a block node and inserts the correct content block html and the given content. It will return the block that was given to it.
	
	Parameters:
	
		block - The block to have content inserted into.
		btype - The block type.
		content - The content to insert.
		
	Returns:
	
		success - html node, block
*/
function insertContent(block, btype, content) {
	if(btype == "xtext")
	{
		/* WYSIWIG uses iframe */
		var xtext = document.createElement("iframe");
		xtext.setAttribute("class", "xTex");
		xtext.setAttribute("maxlength", "1023");
		
		block.appendChild(xtext);

		/* iframe has to be put with document first or some bullshit, so wait one millisecond for that to happen and then insert content */
		setTimeout(function() {
			
			/* create link to css style for iframe content */
			var cssLink = document.createElement("link");
			cssLink.href = "http://abaganon.com/css/block.css";
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";
			
			var iframe = block.childNodes[0].contentDocument;
			iframe.open();
			//iframe.head.appendChild(cssLink); this can be used in show mode, not in edit mode
			iframe.write(content);
			iframe.close();
			
			block = block.childNodes[0];
			
			/* attach keyboard shortcuts to iframe */
			if (iframe.addEventListener) {
			    iframe.addEventListener("keydown", detectKey.bind(null,block), false);
			} else if (iframe.attachEvent) {
			    iframe.attachEvent("onkeydown", detectKey.bind(null,block));
			} else {
			    iframe.onkeydown = detectKey.bind(null,block);
			}
			
		}, 1);
	}
	if(btype == "xcode")
	{
		var xcode = document.createElement("code");
		xcode.setAttribute("class", "xCde");
		xcode.setAttribute("onblur", "renderCode(this)");
		xcode.contentEditable = "true";
		xcode.innerHTML = content;
		
		block.appendChild(xcode);
		
		/* attach keyboard shortcuts to iframe */
		if (xcode.addEventListener) {
		    xcode.addEventListener("keydown", codeKeys.bind(null,block), false);
		} else if (iframe.attachEvent) {
		    xcode.attachEvent("onkeydown", codeKeys.bind(null,block));
		} else {
		    xcode.onkeydown = codeKeys.bind(null,block);
		}
	}
	if(btype == "xmath")
	{
		var preview = '<div class="mathImage"></div>';
		var str = '<div class="xMat" onblur="renderMath(this);" contenteditable>' + content + '</code>';
		block.innerHTML = preview + str;
	}
	if(btype == "latex")
	{
		var preview = '<div class="latexImage"></div>';
		var str = '<div class="xLtx" onblur="renderLatex(this);" contenteditable>' + content + '</code>';
		block.innerHTML = preview + str;
	}
	if(btype == "image")
	{
		var ximg = document.createElement("img");
		ximg.setAttribute("class", "xImg");
		ximg.src = content;
		
		block.appendChild(ximg);
	}
	if(btype == "audio")
	{
		var audio = document.createElement("audio");
		audio.setAttribute("class", "xAud");
		audio.volume = 0.8;
		audio.setAttribute("controls", "controls");
		
		var source = document.createElement("source");
		source.setAttribute("src", content);
		source.setAttribute("type", "audio/mpeg");
		
		audio.appendChild(source);
		block.appendChild(audio);
	}
	if(btype == "video")
	{
		var video = document.createElement("video");
		video.setAttribute("class", "xVid");
		video.volume = 0.8;
		video.setAttribute("controls", "controls");
		
		var source = document.createElement("source");
		source.setAttribute("src", content);
		source.setAttribute("type", "video/mp4");
		
		video.appendChild(source);
		block.appendChild(video);
	}
	if(btype == "slide")
	{
		/* data-page attribute keeps track of which page is being displayed */
		var canvas = document.createElement("canvas");
		canvas.setAttribute("class", "xSli");
		canvas.setAttribute("id", content);
		canvas.setAttribute("data-page", "1");
		
		block.appendChild(canvas);

		/* if block was just made, don't try to load pdf */
		if (content !== "") {
			PDFJS.getDocument(content).then(function (pdfObj) {
				pdfObjects[content] = pdfObj;
				
				var tag = block.childNodes[0];
					    
				renderPDF(pdfObj,1,tag);
			});
		}

		/* event listener for changing slides left & right */
		block.onmouseup = function(event) {
			var X = event.pageX - this.offsetLeft;
			//var Y = event.pageY - this.offsetTop;
			
			/* get the <canvas> tag, current page, pdf url/id, and the pdf total page count */
			var canvas = this.childNodes[0];
			var pageNum = canvas.getAttribute("data-page");
			var pdfID = canvas.getAttribute("id");
			var pageCount = pdfObjects[pdfID].numPages;
			
			/* determine whether left or right side was clicked, then render prev or next page */
			if(X > this.offsetWidth / 1.7) {
				if(pageNum < pageCount) {
					pageNum++;
					canvas.setAttribute("data-page",pageNum);
					renderPDF(pdfObjects[pdfID],pageNum,canvas);
				}
			}
			else {
				if(pageNum > 1) {
					pageNum--;
					canvas.setAttribute("data-page",pageNum);
					renderPDF(pdfObjects[pdfID],pageNum,canvas);
				}
			}
		}
	}
	if(btype == "title")
	{
		var str = '<input type="text" class="xTit" maxlength="64" value="' + content + '">';
		block.innerHTML = str;
	}
	
	return block;
}

/*
	Function: codeKeys
	
	This function is attached as the event listener to the code block. It detects key presses and applies styling.
	
	Parameters:
	
		block - the <code> tag
		event - the keydown event that triggers the function
		
	Returns:
	
		none
*/
function codeKeys(block,event) {
	/* tab */
    if (event.keyCode === 9) {
	    
	    /* prevent default tab behavior */
        event.preventDefault();

		/* grab the cursor location */
        var doc = block.ownerDocument.defaultView;
        var sel = doc.getSelection();
        var range = sel.getRangeAt(0);

		/* insert 4 spaces representing a tab */
        var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
        range.insertNode(tabNode);

		/* replace cursor to after tab location */
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode); 
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

/*
	Function: detectKey
	
	This function is attached as the event listener to the WYSIWIG block. It detects key presses and calls the corresponding js built in execCommand() function on the block to apply html tags to the text. It's useful to note that iframe.contentDocument is the same as iframe.contentWindow.document.
	
	Parameters:
	
		iframe - an iframe node
		event - the keydown event that triggers the function
		
	Returns:
	
		none
*/
function detectKey(iframe,event) {
    
    /* b : bold */
    if(event.shiftKey && event.ctrlKey && event.keyCode == 66)
	{
		iframe.contentDocument.execCommand('bold',false,null);
	}
	/* i : italics */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 73)
	{
		iframe.contentDocument.execCommand('italic',false,null);
	}
	/* l : list */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 76)
	{
		iframe.contentDocument.execCommand('insertUnorderedList',false,null);
	}
	/* + : superscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 187)
	{
		iframe.contentDocument.execCommand('superscript',false,null);
	}
	/* - : subscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 189)
	{
		iframe.contentDocument.execCommand('subscript',false,null);
	}
	/* j : justify left */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 74)
	{
		iframe.contentDocument.execCommand('justifyLeft',false,null);
	}
	/* f : justify full */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 70)
	{
		iframe.contentDocument.execCommand('justifyFull',false,null);
	}
	/* tab : indent */
	if(event.keyCode == 9)
	{
		iframe.contentDocument.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
	}
	/* h - hyperlink */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 72)
	{
		link = prompt('Enter the link: ', 'http://');
		if (link.indexOf("http://") < 0 && link.indexOf("https://") < 0) {
	        link = "http://" + link;
	    }
		iframe.contentDocument.execCommand('createLink',false,link);
	}
		
	// is this necessary ??    
    event.stopPropagation();	
}

/*
	Function: renderCode
	
	This function is a wrapper for whatever function parses and styles the code block. Validation might also be included in here.
	
	Parameters:
	
		block - the block to render
		
	Returns:
	
		none
*/
function renderCode(block) {
	
	/* add code formatting */
	hljs.highlightBlock(block);
	
	// alert the user if they have surpassed our limit
	if(block.textContent.length > 1024)
	{
		alert("There is too much in this code block. The block will not save correctly. Please remove some of its content.");
	}
}

/*
	Function: renderMath
	
	This function is a wrapper for whatever function parses and styles the math block. The rendered math, which is uses MathML <math> tags, is put inside of another div inside the same block. Validation might also be included in here.
	
	Parameters:
	
		block - the block to render
		
	Returns:
	
		none
*/
function renderMath(block) {
	
	/* get the math notation and prepend/append backticks, which is how MathJax identifies ASCIIMath markup language */
	var str = "`" + block.textContent + "`";
	
	/* put the asciimath into the image preview block */
	var imageBlock = block.parentNode.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

/*
	Function: renderLatex
	
	This function is a wrapper for whatever function parses and styles the latex block. The rendered latex, which is uses MathML <math> tags, is put inside of another div inside the same block. Validation might also be included in here.
	
	Parameters:
	
		block - the block to render
		
	Returns:
	
		none
*/
function renderLatex(block) {
	
	/* get the math notation and prepend/append double dollars, which is how MathJax identifies LaTeX markup language */
	var str = "$$" + block.textContent + "$$";
	
	/* put the latex into the image preview block */
	var imageBlock = block.parentNode.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

/*
	Function: renderPDF
	
	This function is a wrapper for whatever function parses and styles the slide block. It's used to render different pdf pages.
	
	Parameters:
	
		pdfDoc - pdf object from pdfObject global array
		pageNum - pdf page to render, found in data-page attribute of <canvas>
		canvas - the <canvas> tag to render pdf page to
		
	Returns:
	
		none
*/
function renderPDF(pdfDoc,pageNum,canvas) {

	// I have no idea what scale does, but it's needed
	var scale = 0.8;

	/* call pdfDoc object's getPage function to get desired page to render */
    pdfDoc.getPage(pageNum).then(function(page) {
	    
	    /* define <canvas> attributes */
		var viewport = page.getViewport(scale);
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		/* define more <canvas> attributes for render() function */
		var renderContext = {
			canvasContext: canvas.getContext('2d'),
			viewport: viewport
		};
		
		/* finally, render the pdf page to canvas */
		var renderTask = page.render(renderContext);
		
		renderTask.promise.then(function () {
			// update stuff here, page has been rendered
		});
    });
}

/*
	Function: insertMath
	
	This function is called when loading a page to copy ASCIIMath from the editor to the display div.
	
	Parameters:
	
		block - the block to render
		
	Returns:
	
		none
*/
function insertMath(block) {
	/* get the math notation and prepend/append backticks */
	var str = "`" + block.childNodes[1].textContent + "`";
	
	/* put the asciimath into the image preview block */
	var imageBlock = block.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

/*
	Function: insertLatex
	
	This function is called when loading a page to copy LaTeX from the editor to the display div.
	
	Parameters:
	
		block - the block to render
		
	Returns:
	
		none
*/
function insertLatex(block) {
	/* get the math notation and prepend/append double dollars */
	var str = "$$" + block.childNodes[1].textContent + "$$";
	
	/* put the latex into the image preview block */
	var imageBlock = block.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

/*
	Function: blockButtons
	
	This creates a div that holds all of the buttons for creating and deleting blocks. This function returns that div.
	
	Parameters:
	
		bid - the block id, which is used to determine where a block should inserted or removed
		
	Returns:
	
		success - html node, button div
*/
function blockButtons(bid) {
	
	/* this div will hold the buttons inside of it */
	var buttonDiv = document.createElement('div');
	buttonDiv.setAttribute('class', 'blockbtns');
	buttonDiv.setAttribute('id', 'b' + bid);
	
	/* the following are all of the buttons */
	
	var txtBtn = document.createElement('button');
	txtBtn.setAttribute("onclick", "addBlock(" + bid + ",'xtext')");
	txtBtn.setAttribute("class", "blockbtn addbtn");
	txtBtn.innerHTML = "text";
	
	var cdeBtn = document.createElement('button');
	cdeBtn.setAttribute("onclick", "addBlock(" + bid + ",'xcode')");
	cdeBtn.setAttribute("class", "blockbtn addbtn");
	cdeBtn.innerHTML = "code";
	
	var matBtn = document.createElement('button');
	matBtn.setAttribute("onclick", "addBlock(" + bid + ",'xmath')");
	matBtn.setAttribute("class", "blockbtn addbtn");
	matBtn.innerHTML = "math";
	
	var ltxBtn = document.createElement('button');
	ltxBtn.setAttribute("onclick", "addBlock(" + bid + ",'latex')");
	ltxBtn.setAttribute("class", "blockbtn addbtn");
	ltxBtn.innerHTML = "latex";
	
	var imgBtn = document.createElement('button');
	imgBtn.setAttribute("onclick", "addBlock(" + bid + ",'image')");
	imgBtn.setAttribute("class", "blockbtn addbtn");
	imgBtn.innerHTML = "image";
	
	var audBtn = document.createElement('button');
	audBtn.setAttribute("onclick", "addBlock(" + bid + ",'audio')");
	audBtn.setAttribute("class", "blockbtn addbtn");
	audBtn.innerHTML = "audio";
	
	var vidBtn = document.createElement('button');
	vidBtn.setAttribute("onclick", "addBlock(" + bid + ",'video')");
	vidBtn.setAttribute("class", "blockbtn addbtn");
	vidBtn.innerHTML = "video";
	
	var sliBtn = document.createElement('button');
	sliBtn.setAttribute("onclick", "addBlock(" + bid + ",'slide')");
	sliBtn.setAttribute("class", "blockbtn addbtn");
	sliBtn.innerHTML = "slides";
	
	var titBtn = document.createElement('button');
	titBtn.setAttribute("onclick", "addBlock(" + bid + ",'title')");
	titBtn.setAttribute("class", "blockbtn addbtn");
	titBtn.innerHTML = "title";
	
	var delBtn = document.createElement('button');
	delBtn.setAttribute('id', 'd' + bid);
	delBtn.setAttribute('onclick', 'deleteBlock(' + bid + ')');
	delBtn.setAttribute("class", "blockbtn delbtn");
	delBtn.style.visibility='hidden';
	delBtn.innerHTML = "&darr;";
	
	/* append the buttons to the div that holds them */
	buttonDiv.appendChild(txtBtn);
	buttonDiv.appendChild(cdeBtn);
	buttonDiv.appendChild(matBtn);
	buttonDiv.appendChild(ltxBtn);
	buttonDiv.appendChild(imgBtn);
	buttonDiv.appendChild(audBtn);
	buttonDiv.appendChild(vidBtn);
	buttonDiv.appendChild(sliBtn);
	buttonDiv.appendChild(titBtn);
	buttonDiv.appendChild(delBtn);
	
	return buttonDiv;
}

/*
	Function: makeSpace
	
	This function creates space for a block that is going to be inserted. In other words, if there are three block 1,2,3, and a block wants to be inserted into the 2nd position, this function will change the current block IDs to 1,3,4.
	
	Parameters:
	
		bid - the block id to make room for
		count - the number of block on the page
		
	Returns:
	
		none
*/
function makeSpace(bid, count) {
	while(bid < count)
	{
		/* change blocks to this value */
		var next = count + 1;
		
		/* replace the button IDs */
		var buttons = blockButtons(next);
		document.getElementById('b' + count).parentNode.replaceChild(buttons,document.getElementById('b' + count));
		
		/* replace the content block id */
		document.getElementById('a' + count).setAttribute('id', 'a' + next);
		
		/* replace the block id */
		document.getElementById(count).setAttribute('id', next);
		
		/* update the count */
		count--;
	}
}

/*
	Function: insertBlock
	
	This function creates a block, appends a content block & buttons div to it, and inserts it on the page.
	
	Parameters:
	
		block - a content block
		buttons - a buttons div
		bid - the block id of the block to be inserted
		count - the number of block on the page
		
	Returns:
	
		none
*/
function insertBlock(block,buttons,bid,count) {
	
	/* grab the blocks container */
	var blocksdiv = document.getElementById('blocks');
	
	/* create the block div */
	var group = document.createElement('div');
	group.setAttribute('class', 'block');
	group.setAttribute('id', bid);
	
	/* append the content block & buttons div to the block div */
	group.appendChild(block);
	group.appendChild(buttons);
	
	/* find the location to insert the block and insert it */
	if(bid <= count) {
		var position = document.getElementById('blocks').children[bid];
		document.getElementById('blocks').insertBefore(group, position);
	} else {
		/* you do this if the block goes at the end, it's the last block */
		blocksdiv.appendChild(group);
	}
}

/*
	Function: createBlock
	
	This function calls all of the necessary functions to put a block on the page.
	
	Parameters:
	
		bid - the block id
		btype - the block type
		
	Returns:
	
		none
*/
function createBlock(bid,btype) {

	var blockCount = countBlocks();
	
	/* make space if inserting block, if appending block, ignore */
	if(bid < blockCount)
	{ makeSpace(bid, blockCount); }
	
	/* create and insert block */
	bid++;
	
	var content = "";
	
	var block = generateBlock(bid,btype);
	block = insertContent(block, btype, content);
	var blockbuttons = blockButtons(bid);
	insertBlock(block,blockbuttons,bid,blockCount);
	
	/* make delete buttons visible */
	var i = 0;
	while(i <= blockCount)
	{
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
	
	/* save blocks to temp table, indicated by false */
	saveBlocks(false);
}

/*
	Function: addBlock
	
	This function is the starting point for adding a block. It calls the right function for creating a block according to the block type.
	
	Parameters:
	
		bid - the block id
		btype - the block type
		
	Returns:
	
		none
*/
function addBlock(bid,btype) {
	
	/* xtext calls createBlock() to add the block. Then the iframe must be put into designMode */
	if(btype == "xtext")
	{
		createBlock(bid,btype);
		
		/* grab the block iframe that was just made */
		var block = document.getElementById("a" + (bid + 1)).childNodes[0];
		var blockDoc = block.contentDocument;
		
		/* make iframe editable */
		blockDoc.designMode = "on";
	}
	
	/* these blocks call createBlock() to add the block */
	if (["xcode","xmath","latex","title"].indexOf(btype) > -1)
	{
		createBlock(bid,btype);
	}
	
	/* these blocks call uploadMedia() which uploads media and then calls createBlock() */
	if (["image","audio","video","slide"].indexOf(btype) > -1)
	{
		uploadMedia(bid + 1,btype);
	}
}

/*
	Function: closeSpace
	
	This function closes the space left by a removed block. In other words, if there are three block 1,2,3, and a the 2nd block is removed, this function will change the current block IDs from 1,3 to 1,2.
	
	Parameters:
	
		bid - the block id to close on
		count - the number of block on the page
		
	Returns:
	
		none
*/
function closeSpace(bid,count) {
	while(bid < count)
	{
		/* change blocks to this value */
		var next = bid + 1;
		
		/* replace the button IDs */
		var buttons = blockButtons(bid);
		document.getElementById('b' + next).parentNode.replaceChild(buttons,document.getElementById('b' + next));
		
		/* replace the content block id */
		document.getElementById('a' + next).setAttribute('id', 'a' + bid);
		
		/* replace the block id */
		document.getElementById(next).setAttribute('id', bid);
		
		/* update the bid */
		bid++;
	}
}

/*
	Function: removeBlock
	
	This function removes a block.
	
	Parameters:
	
		bid - the block id of the block to remove
		
	Returns:
	
		nothing - *
*/
function removeBlock(bid) {
	var element = document.getElementById(bid);
	element.parentNode.removeChild(element);
}

/*
	Function: deleteBlock
	
	This function is the starting point for removing a block. It calls the needed functions to handle block removal.
	
	Parameters:
	
		bid - the block id of the block to remove
		
	Returns:
	
		nothing - *
*/
function deleteBlock(bid) {
	var blockCount = countBlocks();
	
	bid++;
	
	/* delete the block */
	removeBlock(bid);
	
	/* close space if removing block from middle, otherwise ignore */
	if(bid < blockCount)
	{ closeSpace(bid, blockCount); }
	
	/* make delete buttons visible & last button invisible */
	var i = 0;
	blockCount = countBlocks();
	while(i < blockCount)
	{
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
	document.getElementById('d' + i).style.visibility = 'hidden';
}

/*
	Section: AJAX Functions
	These functions send ajax requests
*/

/*
	Function: uploadMedia
	
	This function make an ajax request to upload user media. After the response, the media is loaded and rendered.
	
	Parameters:
	
		bid - the bid of the media block
		btype - the type of media, "image" "audio" "video" "slide"
		
	Returns:
	
		none
*/
function uploadMedia(bid,btype) {
	
	/* get the hidden file-select object that will store the user's file selection */
	var fileSelect = document.getElementById('file-select');
	
	/* uploadMedia() is called when a block button is pressed, to show file select pop-up box, force click the file-select object */
	fileSelect.click();
	
	/* only upload media when a file select change has occurred, this prevents an empty block creation if the user presses 'cancel' */
	fileSelect.onchange = function()  {
		
		/* grab the selected file */
		var file = fileSelect.files[0];
			
		// place some checks here
		// file.type.match('image.*')
		notvalid = false;
		
		if(notvalid) {
			
			alert("Invalid File Format");
			
		} else {
		
			/* create the block to host the media */
			createBlock(bid - 1,btype);
		
			/* wrap the ajax request in a promise */
			var promise = new Promise(function(resolve, reject) {
				
				/* create javascript FormData object and append the file */
				var formData = new FormData();
				formData.append('media', file, file.name);
				
				/* get the page id */
				var pid = document.getElementsByName('pageid')[0].value;
				
				/* grab the domain and create the url destination for the ajax request */
				var url = window.location.href;
				var splitUrl = url.split("/");
				
				/* [0] refers to "http:" & [2] refers to the domain "abaganon.com", [1] is just empty */
				url = splitUrl[0] + "//" + splitUrl[2] + "/xample/uploadmedia?" + "pid=" + pid + "&btype=" + btype;
				
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open('POST', url, true);
				
				xmlhttp.onreadystatechange = function() {
			        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
						if(xmlhttp.status == 200){
				        	resolve(xmlhttp.response);
						}
						else {
							alert('Error:' + xmlhttp.status + ": Please Try Again");
						}
			        }
			    }
				    
				xmlhttp.send(formData);
			});
			
			promise.then(function(success) { 
				
				if (success == "nouploadloggedout") {
					deleteBlock(bid - 1);
					alert("You Can't Upload Media Because You Are Logged Out. Log Back In On A Separate Page, Then Return Here & Try Again.");
				} else {
					/* set the image source */
					if (btype == "image") {
						var tag = document.getElementById('a' + bid).childNodes[0];
						tag.src = success;
					}
					/* audio & video divs have their src set in an extra child node */
					else if(btype == "audio" || btype == "video") {
						var tag = document.getElementById('a' + bid).childNodes[0].childNodes[0];
						tag.src = success;
						tag.parentNode.load(); 
					}
					else if(btype == "slide")
					{
						/* add the pdf to the pdfObjects array and render the first page */
						PDFJS.getDocument(success).then(function (pdfObj) {
						    
						    pdfObjects[success] = pdfObj;
						    
						    var tag = document.getElementById('a' + bid).childNodes[0];
						    tag.setAttribute("id", success);
						    
							renderPDF(pdfObj,1,tag);
						});
					}
				}
				
				
			}, function(error) {
					/* error is data passed thorugh reject */
			});
		}
	}		
}

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
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/login";
	
	/* get the entered username and password */
	var username = document.getElementsByName('username-login')[0].value;
	var password = document.getElementsByName('password-login')[0].value;
	
	// instant validation needed
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "username=" + username + "&password=" + password;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "loggedin") {
		        	emptyDiv('content');
		        	displayHome();
	        	}
	        	else if(xmlhttp.responseText == "incorrect") {
		        	alert("The Passowrd Was Incorrect");
	        	} else if(xmlhttp.responseText == "notfound") {
		        	alert("The Username Could Not Be Found");
		        } else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
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
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/signup";
	
	/* get the user information */
	var username = document.getElementsByName('username-signup')[0].value;
	var email = document.getElementsByName('email-signup')[0].value;
	var phone = document.getElementsByName('phone-signup')[0].value;
	var password = document.getElementsByName('password-signup')[0].value;
	var password = document.getElementsByName('password-signup-check')[0].value;
	
	// instant validation needed
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "username=" + username + "&email=" + email + "&phone=" + phone + "&password=" + password;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "success") {
		        	emptyDiv('content');
		        	displayHome();
	        	}
	        	else if(xmlhttp.responseText == "exists") {
		        	alert("That Username Already Exists.\nPlease Choose A Different One.");
	        	} else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}

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
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/logout";
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "loggedout") {
		        	emptyDiv('content');
		        	displayLanding();
	        	} else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send();
}

/*
	Function: profile
	
	This function opens the profile page in a different window.
	
	Parameters:
	
		none
		
	Returns:
	
		nothing - *
*/
function profile() {
	alert("Haven't Coded This Yet");
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
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/createpage";
	
	/* get the page name */
	var pagename = document.getElementsByName('pagename-create')[0].value;
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "pagename=" + pagename;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "pageexists") {
		        	alert("You Already Have A Page With That Name.");
	        	} else if (xmlhttp.responseText == "err") {
		        	alert("An Error Occured. Please Try Again Later");
		        } else {
		        	window.location = domain + "xample/editpage?page=" + xmlhttp.responseText;
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
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
	
	var promise = new Promise(function(resolve, reject) {
	
		/* create the url destination for the ajax request */
		var url = window.location.href;
		var splitUrl = url.split("/");
	
		url = splitUrl[0] + "//" + splitUrl[2] + "/xample/getpages";
		
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("POST", url, true);
		
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		xmlhttp.onreadystatechange = function() {
	        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
				if(xmlhttp.status == 200) {
		        	if(xmlhttp.responseText == "err") {
			        	alert("An Unknown Error Occurred");
		        	} else {
			        	resolve(xmlhttp.responseText);
		        	}
				}
				else {
					alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
	        }
	    }
		    
		xmlhttp.send();
	});
	
	return promise;
}

/*
	Function: saveBlocks
	
	This function grabs block data and sends it to the back-end for saving.
	
	Parameters:
	
		which - should be a boolean. false saves blocks to database temporary table, true saves blocks to database permanent table.
		
	Returns:
	
		nothing - *
*/
function saveBlocks(which) {
	
	/* set parameter to be sent to back-end that determines which table to save to, temp or perm */
	var table;
	if(which === false) {
		table = 0;
	} else {
		table = 1;
	}
	
	document.getElementsByName('statusid')[0].setAttribute('value', table);
	
	/* variables for storing block data */
	var blockType = [];
	var blockContent = [];
	
	var blockCount = countBlocks();
	var bid = 1;
	
	//
	// need solution for escaping: ' , & in the xtext,xcode,latex,xmath blocks
	// ' breaks strings , breaks arrays & breaks ajax params
	//
	
	/* get the block types & contents */
	if(blockCount > 0)
	{
		var i = 0;
		while(blockCount >= bid)
		{
			/* get the block type */
			var btype = document.getElementById('a' + bid).className;
			blockType[i] = btype;
			
			/* grab block content based on block type */
			if (btype == "xtext") {
				
				/* execCommand() applies style tags to <body> tag inside <iframe>, hence .getElementsByTagName('body')[0] */
				blockContent[i] = document.getElementById('a' + bid).children[0].contentDocument.getElementsByTagName('body')[0].innerHTML;
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			} else if (btype == "xcode") {
				blockContent[i] = document.getElementById('a' + bid).children[0].textContent;
				
				// this needs to grab innerHTML instead and will need to be passed through a parse
				// needs to ignore all span classes: "<span" to next ">" and "</span>"
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			}
			else if (btype == "latex" || btype == "xmath") {
				/* replace() is for escaping backslashes */
				blockContent[i] = document.getElementById('a' + bid).children[1].innerHTML.replace(/\\/g, "\\\\");
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			}
			else if (btype == "image") {
				var str = document.getElementById('a' + bid).children[0].src;
				blockContent[i] = str.replace(location.href.substring(0, location.href.lastIndexOf('/')+1), "");
				
			}
			else if (btype == "audio" || btype == "video") {
				var str = document.getElementById('a' + bid).children[0].children[0].src;
				blockContent[i] = str.replace(location.href.substring(0, location.href.lastIndexOf('/')+1), "");
			}
			else if (btype == "slide") {
				var str = document.getElementById('a' + bid).children[0].id;
				blockContent[i] = str.replace(location.href.substring(0, location.href.lastIndexOf('/')+1), "");
			}
			else if (btype == "title") {
				blockContent[i] = document.getElementById('a' + bid).children[0].value;
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			}
			
			i++;
			bid++;
		}
		
		/* merge mediaType & mediaContent arrays into default comma-separated strings */
		var types = blockType.join();
		var contents = blockContent.join();	
	}
		
	/* create the url destination for the ajax request */
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/saveblocks";
	
	/* get pagename & pageid */
	var pid = document.getElementsByName('pageid')[0].value;
	var pagename = document.getElementsByName('pagename')[0].value;
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "mediaType=" + types + "&mediaContent=" + contents + "&pid=" + pid + "&pagename=" + pagename + "&tabid=" + table;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "blockssaved") {
			        	// successful save
		        	} else if (xmlhttp.responseText == "nosaveloggedout") {
			        	alert("You Can't Save This Page Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again.")
		        	} else {
			        	alert("An Unknown Error Occurred");
		        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}

/*
	Function: revertBlocks
	
	This function loads the page with last permanent save data.
	
	Parameters:
	
		none
		
	Returns:
	
		nothing - *
*/
function revertBlocks() {
	alert("Haven't Coded This Yet");
}








