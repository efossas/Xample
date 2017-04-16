/* eslint-env browser, es6 */
/******
	Title: Block Page
	This is the front-end for Xample Block Pages
******/

/***
	Section: Globals
	These are the global variables xample uses
***/

// <<<code>>>

/* from Bengine.js */
/*
	global extensibles:true
*/
/* from omni.js */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
	global barPageSettings:true
	global btnLink:true
	global btnSubmit:true
	global barLog:true
	global barInfo:true
	global barMenu:true
	global barStatus:true
	global barSubMenu:true
	global formSignUp:true
	global getCookies:true
	global getSubjects:true
	global getUserFields:true
	global globalScope:true
	global journalError:true
	global setBookmark:true
	global setView:true
	global watermark:true
*/
/*
	global Bengine:true
	global MathJax:true
	global PDFJS:true
	global hljs:true
	global alertify:true
*/

// <<<fold>>>

/***
	Section: Block Objects
	Any block you wish to define for the page go here.
***/

// <<<code>>

var wiseEngine;
var blockExtensibles = extensibles;

// <<<fold>>>

/***
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

/*
	Function: loadWhichPage

	This function loads the either the user's temporary or permanent block page.

	Parameters:

		pid - string, the page id
		which - string, either 'temp' or 'perm'

	Returns:

		nothing - *
*/
function loadWhichPage(pid,which) {
	var status;
	if(which === 'temp') {
		status = 'true';
	} else if (which === 'perm') {
		status = 'false';
	} else {
		return;
	}

	/* redirect to correct page */
	var url = createURL("/editpage?page=" + pid + "&temp=" + status);
	window.location = url;
}

// <<<fold>>>

/***
	Section: Page Functions
	These are the only functions called directly by back-end to start a page.
***/

// <<<code>>>

/*
	Function: pageChoose

	This function loads the choose page display. A user is given the option to either load their last permanent save or their last temporary save.

	Parameters:

		pid - the page id

	Returns:

		nothing - *
*/
function pageChoose(pid) {

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	var colMiddle = document.createElement("div");
	colMiddle.setAttribute("class","col col-100 pad-10");

	var centerParagraph = document.createElement("p");
	centerParagraph.innerHTML = "You are viewing this because the page was closed without Revert or Save being clicked. Please choose which page you want to save.";

	colMiddle.appendChild(centerParagraph);
	rowOne.appendChild(colMiddle);

	/* row 2 */
	var rowTwo = document.createElement("div");
	rowTwo.setAttribute("class","row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-50 pad-10");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-50 pad-10");

	rowTwo.appendChild(colLeft);
	rowTwo.appendChild(colRight);

	var leftParagraph = document.createElement("p");
	leftParagraph.innerHTML = "This is your last temporary save. This save contains the blocks from the last time you added a block.";

	var tempBtn = document.createElement('button');
	tempBtn.setAttribute('type','button');
	tempBtn.setAttribute('class','menubtn green-btn');
	tempBtn.setAttribute('value','submit-temp');
	tempBtn.setAttribute('onclick','loadWhichPage(' + pid + ',"temp");');
	tempBtn.innerHTML = "Temporary Page";

	var rightParagraph = document.createElement("p");
	rightParagraph.innerHTML = "This is you last permanent save. This save contains the blocks from the last time you clicked Save.";

	var permBtn = document.createElement('button');
	permBtn.setAttribute('type','button');
	permBtn.setAttribute('class','menubtn green-btn');
	permBtn.setAttribute('value','submit-perm');
	permBtn.setAttribute('onclick','loadWhichPage(' + pid + ',"perm");');
	permBtn.innerHTML = "Permanent Page";

	colLeft.appendChild(tempBtn);
	colLeft.appendChild(leftParagraph);
	colRight.appendChild(permBtn);
	colRight.appendChild(rightParagraph);

	/* main */
	var main = document.getElementById("content");
	main.appendChild(rowOne);
	main.appendChild(rowTwo);
}

/*
	Function: pageEdit

	This function loads page data in edit mode.

	Parameters:

		aid - number, the author id; which is the uid of the creator of the block page
		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageEdit(aid,pagedata,pageinfo) {
	/* grab the main div */
	var engineID = 'content';
	var main = document.getElementById(engineID);

	/* hidden pid & title */
	var pid = pageinfo.id;
	var pagename = pageinfo.name;

	/*** MENU & STATUS BAR ***/

	/* create menu & status bar */
	var menu = barMenu();
	var status = barStatus(pid,engineID);
	var pageSettings = barPageSettings('page',aid,pageinfo,engineID);

	/* create submenu */
	var submenu = barSubMenu('Page Settings',pageSettings);

	/* append menu & status to main */
	main.appendChild(menu);
	main.appendChild(status);
	main.appendChild(submenu);

	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	var blockOptions = {
		blockLimit:8
	};
	wiseEngine = new Bengine(blockExtensibles,{},blockOptions);

	wiseEngine.blockEngineStart(engineID,["page",pid,pid],blockarray);

	/*** AFTER STUFF ***/

	/* start auto save timer */
	autosaveTimer(document.getElementById("bengine-autosave-" + engineID + "-"),function() {
		return wiseEngine.saveBlocks(true);
	});

	/* set defaulttext in globals */
	var promiseDefaultText = getUserFields(['defaulttext']);

	promiseDefaultText.then(function(data) {
		if(data.defaulttext) {
			globalScope.defaulttext = true;
		} else {
			globalScope.defaulttext = false;
		}
	},function(error) {
		globalScope.defaulttext = false;
		alertify.alert("Error. Default Text Could Not Be Initiated.");
	});

	/* prevent user from exiting page if Revert or Save has not been clicked */
	window.onbeforeunload = function() {
		var status = document.getElementById("bengine-statusid").value;
		if(status === '0') {
			/// this text isn't being displayed... some default is instead
			return "Please click Revert or Save before exiting.";
		}
		return null;
	};
}

/*
	Function: pageEmbed

	This function loads page data in show mode & embed style.

	Parameters:

		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageEmbed(pagedata,pageinfo) {
	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	wiseEngine = new Bengine(blockExtensibles,{},{enableSingleView:true});
	wiseEngine.blockContentShow('content-embed',["page",pageinfo.id],blockarray);
}

/*
	Function: pageShow

	This function loads page data in show mode.

	Parameters:

		logstatus - boolean, true if logged in or false otherwise.
		mtoggle - boolean, true displays all & false displays only blocks
		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageShow(logstatus,mtoggle,pagedata,pageinfo) {
	/* grab the main div */
	var main = document.getElementById('content');

	/* hidden pid & title */
	var pid = pageinfo.id;
	var pagename = pageinfo.name;

	if(mtoggle) {

		/* watermark */
		main.appendChild(watermark());

		/*** MENU BAR ***/

		/* create menu & info bar */
		var menu;
		if(logstatus === true) {
			menu = barMenu();
		} else {
			menu = barLog();
		}
		var info = barInfo('page',pageinfo);

		/* append menu & status to main */
		main.appendChild(menu);
		main.appendChild(info);

		var spaceDiv = document.createElement('div');
		spaceDiv.setAttribute('style','padding-bottom:20px;');
		main.appendChild(spaceDiv);

		/* page title input */
		var title = document.createElement('input');
		title.setAttribute('type','text');
		title.setAttribute('name','pagename');
		title.setAttribute('class','page-title');
		title.setAttribute('maxlength','50');
		title.setAttribute('value',pagename);
		title.setAttribute('style','display: none;');
		menu.appendChild(title);

	}

	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	wiseEngine = new Bengine(blockExtensibles,{},{});

	wiseEngine.blockContentShow('content',["page",pid],blockarray);

	/* set time out to register view */
	setTimeout(function() {
		setView('page',pageinfo.aid,pageinfo.id);
	},61000);
}

// <<<fold>>>
