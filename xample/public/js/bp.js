/* eslint-env browser, es6 */
/******
	Title: Block Page
	This is the front-end for Xample Block Pages
******/

/***
	Section: Globals
	These are the global variables xample uses

	pdfObjects - pdf.js generates pdf objects that can be used to render individual pages to <canvas>
	globalScope - attach needed global variables as properties to this object
***/

// <<<code>>>

var pdfObjects = {};
var globalScope = {};

/* list any functions that will be joined to this file here */
/*
	global createURL:true
	global emptyDiv:true
	global btnLink:true
	global btnSubmit:true
	global getUserFields:true
*/

/* list any objects from other js files here */
/*
	global MathJax:true
	global PDFJS:true
	global hljs:true
	global alertify:true
*/

// <<<fold>>>

/***
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

/*
	Function: deparseBlock

	Block data must be passed through this to replace any encodings back to their original values.

	Parameters:

		blockType - string, the block's type
		blockText - string, the block's data

	Returns:

		success - string, the deparsed block's data.
*/
function deparseBlock(blockType,blockText) {
	var deparsed = blockText.replace(/@SP@/g," ").replace(/@HS@/g,"&nbsp;").replace(/@AM@/g,"&").replace(/@DQ@/g,"\"").replace(/@SQ@/g,"'").replace(/@CO@/g,",").replace(/@PL@/g,"+").replace(/@BR@/g,"<br>").replace(/@BC@/g,"</br>");
	if(blockType === "xtext") {
		//deparsed = "";
	} else if (blockType === "xcode") {
		//deparsed = "";
	} else {
		//deparsed = "";
	}
	return deparsed;
}

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

/*
	Function: deparseBlock

	Block data must be passed through this to replace any chars that can break functionality with encodings.

	spaces -  ajax urls
	&nbsp; - ajax delimiters
	& - ajax delimiters
	" - ajax strings
	' - ajax strings
	, - array delimiters
	+ - interpreted as spaces in urls
	<br> - maintaini new lines

	Parameters:

		blockType - string, the block's type
		blockText - string, the block's data

	Returns:

		success - string, the parsed block's data.
*/
function parseBlock(blockType,blockText) {
	var parsed = blockText.replace(/ /g,"@SP@").replace(/&nbsp;/g,"@HS@").replace(/&/g,"@AM@").replace(/"/g,"@DQ@").replace(/'/g,"@SQ@").replace(/,/g,"@CO@").replace(/\+/g,"@PL@").replace(/<br>/g,"@BR@").replace(/<\/br>/g,"@BC@");
	if(blockType === "xtext") {
		//parsed = "";
	} else if (blockType === "xcode") {
		parsed = parsed.replace(/<span[^>]*>/g,"").replace(/<\/span>/g,"");
	} else {
		//parsed = "";
	}
	return parsed;
}

// <<<fold>>>

/***
	Section: Display Functions
	These are functions to create, remove, or show page elements (except for blocks).
***/

// <<<code>>>

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
	Function: dashSaveBar

	Creates the save bar. The save holds other divs that display save status & messages.

	Parameters:

		none

	Returns:

		success - html node, save bar
*/
function dashSaveBar() {
	var savebar = document.createElement("div");
	savebar.setAttribute("id","savebar");

	return savebar;
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
	Function: formDropDownsSCT

	Creates the form for selecting Subject, Category, Topic.

	Parameters:

		none

	Returns:

		success - html node, dropdowns.
*/
function formDropDownsSCT() {
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
	listTopics.setAttribute("onchange","greyFirstSelect(this);");
	listTopics.style = "color: grey";

	/* get subjects for select topic list */
	var subjectsPromise = getSubjects();

	subjectsPromise.then(function(success) {
		var subjectsData = JSON.parse(success);
		globalScope.subjects = subjectsData;

		/* first box - subject names */
		var subjectsNames = Object.keys(subjectsData);
		var subjectsCount = subjectsNames.length;

		var optionSubject = document.createElement('option');
		optionSubject.innerHTML = "choose subject";
		optionSubject.setAttribute("value","");
		listSubjects.appendChild(optionSubject);

		for(var i = 0; i < subjectsCount; i++) {
			optionSubject = document.createElement('option');
			optionSubject.setAttribute('value',subjectsNames[i]);
			optionSubject.innerHTML = subjectsNames[i];
			listSubjects.appendChild(optionSubject);
		}

		/* second box - category names */
		var optionCategory = document.createElement('option');
		optionCategory.innerHTML = "choose category";
		listCategories.appendChild(optionCategory);

		/* third box - topic names */
		var optionTopic = document.createElement('option');
		optionTopic.innerHTML = "choose topic";
		listTopics.appendChild(optionTopic);

	},function(error) {
		///journal console.log("getSubjects promise error: " + error);
	});

	/* append lists to columns */
	colLeft_SubjectSelect.appendChild(listSubjects);
	colMiddle_SubjectSelect.appendChild(listCategories);
	colRight_SubjectSelect.appendChild(listTopics);

	return row_SubjectSelect;
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

		pagedata - string, page data is received in the format "pid,pagename,(mediaType,mediaContent,)"

	Returns:

		nothing - *
*/
function pageEdit(pagedata) {

	/* MENU */

	/* create top div to wrap all header elements */
	var menu = document.createElement("div");
	menu.setAttribute("class","block-menu");

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	var colOneLeft = document.createElement("div");
	colOneLeft.setAttribute("class","col col-15");

	var colOneMiddle = document.createElement("div");
	colOneMiddle.setAttribute("class","col col-70 pad-10");

	var colOneRight = document.createElement("div");
	colOneRight.setAttribute("class","col col-15");

	rowOne.appendChild(colOneLeft);
	rowOne.appendChild(colOneMiddle);
	rowOne.appendChild(colOneRight);

	/* log out button */
	var logout = btnSubmit('Log Out','logout','red');

	/* save bar */
	var savebar = dashSaveBar();

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

	/* profile button */
	var profile = btnLink('Profile',createURL('/profile'),'green');

	/* block array -> pid,pagename,mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray = pagedata.split(',');

	/* hidden pid & title */
	var pid = blockarray[0];
	var pagename = blockarray[1];

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

	/* append elements to row 1 */
	colOneLeft.appendChild(logout);
	colOneMiddle.appendChild(savebar);
	colOneRight.appendChild(profile);

	/* append row 1 to the menu */
	menu.appendChild(pageid);
	menu.appendChild(statusid);
	menu.appendChild(rowOne);

	/* row 2 */
	var rowTwo = document.createElement("div");
	rowTwo.setAttribute("class","row");

	var colTwoLeft = document.createElement("div");
	colTwoLeft.setAttribute("class","col col-15");

	var colTwoMiddle = document.createElement("div");
	colTwoMiddle.setAttribute("class","col col-70 pad-10");

	var colTwoRight = document.createElement("div");
	colTwoRight.setAttribute("class","col col-15");

	rowTwo.appendChild(colTwoLeft);
	rowTwo.appendChild(colTwoMiddle);
	rowTwo.appendChild(colTwoRight);

	/* revert btn */
	var revertbtn = document.createElement('button');
	revertbtn.setAttribute('type','button');
	revertbtn.setAttribute('name','revert-blocks');
	revertbtn.setAttribute('class','menubtn green-btn');
	revertbtn.setAttribute('onclick','revertBlocks()');
	revertbtn.innerHTML = "Revert";

	/* page title input */
	var title = document.createElement('input');
	title.setAttribute('type','text');
	title.setAttribute('name','pagename');
	title.setAttribute('class','page-title');
	title.setAttribute('maxlength','50');
	title.setAttribute('value',pagename);

	/* save btn */
	var savebtn = document.createElement('button');
	savebtn.setAttribute('type','button');
	savebtn.setAttribute('name','save-blocks');
	savebtn.setAttribute('class','menubtn green-btn');
	savebtn.setAttribute('onclick','saveBlocks(true)');
	savebtn.innerHTML = "Save";

	/* append elements to row 2 */
	colTwoLeft.appendChild(revertbtn);
	colTwoMiddle.appendChild(title);
	colTwoRight.appendChild(savebtn);

	/* append row 2 to the menu */
	menu.appendChild(rowTwo);

	/* BLOCKS */

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','blocks');
	blocksdiv.setAttribute('id','blocks');

	/* initial first block buttons */
	var buttons = blockButtons(0);
	blocksdiv.appendChild(buttons);

	var count = 2;
	var i = 1;

	while(count < blockarray.length) {
		/* create the block */
		var block = insertContent(i,blockarray[count],blockarray[count + 1]);

		/* create the block buttons */
		buttons = blockButtons(i);

		/* create block + button div */
		var group = document.createElement('div');
		group.setAttribute('class','block');
		group.setAttribute('id',i);

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
	fileinput.setAttribute('type','file');
	fileinput.setAttribute('id','file-select');

	var filebtn = document.createElement('button');
	filebtn.setAttribute('type','submit');
	filebtn.setAttribute('id','upload-button');

	var url = createURL("/uploadmedia");

	var fileform = document.createElement('form');
	fileform.setAttribute('id','file-form');
	fileform.setAttribute('action',url);
	fileform.setAttribute('method','POST');
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
	i = 0;
	var blockCount = countBlocks();
	while(i < blockCount) {
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

	/* start auto save timer */
	autosaveTimer(autosave);

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
		var status = document.getElementsByName("statusid")[0].value;
		if(status === '0') {
			/// this text isn't being displayed... some default is instead
			return "Please click Revert or Save before exiting.";
		}
		return null;
	};
}

// <<<fold>>>

/***
	Section: Block Functions
	These are functions that handle the block generator
***/

// <<<code>>>

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
	while (miss === true) {
		num++;

		/* undefined is double banged to false, and node is double banged to true */
		miss = Boolean(document.getElementById(num));
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
function insertContent(bid,btype,content) {
	var block = generateBlock(bid,btype);

	if(btype === "xtext") {
		/* WYSIWIG uses iframe */
		var xtext = document.createElement("iframe");
		xtext.setAttribute("class","xTex");
		xtext.setAttribute("maxlength","1023");

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
			/// iframe.head.appendChild(cssLink); this can be used in show mode,not in edit mode

			/* defaul text */
			if(globalScope.defaulttext && content === "") {
				iframe.write("You can turn this default text off on your Profile Page.<br><br>Press&nbsp;<kbd>shift</kbd>&nbsp;and&nbsp;<kbd>ctrl</kbd>&nbsp;with the following keys to style text:<br><br><kbd>p</kbd>&nbsp;plain<br><kbd>b</kbd>&nbsp;<b>bold</b><br><kbd>i</kbd>&nbsp;<i>italics</i><br><kbd>h</kbd>&nbsp;<span style='background-color: yellow;'>highlight</span><br><kbd>+</kbd>&nbsp;<sup>superscript</sup><br><kbd>-</kbd>&nbsp;<sub>subscript</sub><br><kbd>a</kbd>&nbsp;<a href='http://abaganon.com/'>anchor link</a><ul><li><kbd>l</kbd>&nbsp;list</li></ul><kbd>j</kbd>&nbsp;justify left<br><i>For the things we have to learn before we can do them, we learn by doing them</i>. -Aristotle &nbsp;<i>I hear and I forget.&nbsp;I&nbsp;see and I remember. I do and I understand</i>. &nbsp;-? &nbsp;<i>If you want to go fast, go it alone. If you want to go far, go together.&nbsp;</i>-? &nbsp;<i>If you can't explain it simply, you don't understand it well enough.&nbsp;</i>-Einstein &nbsp;<i>Age is an issue of mind over matter. If you don't mind, it doesn't matter.</i>&nbsp;-Twain<br><br><kbd>f</kbd>&nbsp;justify full<div style='text-align: justify;'><i style='text-align: start;'>For the things we have to learn before we can do them, we learn by doing them</i><span style='text-align: start;'>. -Aristotle &nbsp;</span><i style='text-align: start;'>I hear and I forget.&nbsp;I&nbsp;see and I remember. I do and I understand</i><span style='text-align: start;'>. &nbsp;-? &nbsp;</span><i style='text-align: start;'>If you want to go fast, go it alone. If you want to go far, go together.&nbsp;</i><span style='text-align: start;'>-? &nbsp;</span><i style='text-align: start;'>If you can't explain it simply, you don't understand it well enough.&nbsp;</i><span style='text-align: start;'>-Einstein &nbsp;</span><i style='text-align: start;'>Age is an issue of mind over matter. If you don't mind, it doesn't matter.</i><span style='text-align: start;'>&nbsp;-Twain</span>");
			} else {
				iframe.write(deparseBlock(btype,content));
			}
			iframe.close();

			block = block.childNodes[0];

			/* attach keyboard shortcuts to iframe */
			if (iframe.addEventListener) {
				iframe.addEventListener("keydown",detectKey.bind(null,block),false);
			} else if (iframe.attachEvent) {
				iframe.attachEvent("onkeydown",detectKey.bind(null,block));
			} else {
				iframe.onkeydown = detectKey.bind(null,block);
			}

		},1);
	} else if(btype === "xcode") {

		var xcode = document.createElement("code");
		xcode.setAttribute("class","xCde");
		xcode.setAttribute("onblur","renderCode(this)");
		xcode.contentEditable = "true";

		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			xcode.innerHTML = "var description = 'Programming languages are auto-detected.';<br>function default(parameter) {<br>&nbsp;&nbsp;&nbsp;&nbsp;var instructions = 'When you click outside the block syntax is highlighted.';<br>&nbsp;&nbsp;&nbsp;&nbsp;alert(parameter + instructions);<br>}<br>default(description);";
		} else {
			xcode.innerHTML = deparseBlock(btype,content);
		}

		block.appendChild(xcode);

		/* attach keyboard shortcuts to iframe */
		if (xcode.addEventListener) {
			xcode.addEventListener("keydown",codeKeys.bind(null,block),false);
		} else if (xcode.attachEvent) {
			xcode.attachEvent("onkeydown",codeKeys.bind(null,block));
		} else {
			xcode.onkeydown = codeKeys.bind(null,block);
		}
	} else if(btype === "xmath") {
		var mathpreview = '<div class="mathImage"></div>';

		var mathstr;
		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			mathstr = '<div class="xMat" onblur="renderMath(this);" contenteditable>AsciiMath \\ Mark \\ Up: \\ \\ \\ sum_(i=1)^n i^3=((n(n+1))/2)^2</div>';
		} else {
			mathstr = '<div class="xMat" onblur="renderMath(this);" contenteditable>' + deparseBlock(btype,content) + '</div>';
		}

		block.innerHTML = mathpreview + mathstr;
	} else if(btype === "latex") {

		var latexpreview = '<div class="latexImage"></div>';

		var latexstr;
		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			latexstr = '<div class="xLtx" onblur="renderLatex(this);" contenteditable>LaTeX \\ Mark \\ Up: \\quad \\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)</div>';
		} else {
			latexstr = '<div class="xLtx" onblur="renderLatex(this);" contenteditable>' + deparseBlock(btype,content) + '</div>';
		}
		block.innerHTML = latexpreview + latexstr;
	} else if(btype === "image") {
		var ximg = document.createElement("img");
		ximg.setAttribute("class","xImg");
		ximg.src = content;

		block.appendChild(ximg);
	} else if(btype === "audio") {
		var audio = document.createElement("audio");
		audio.setAttribute("class","xAud");
		audio.volume = 0.8;
		audio.setAttribute("controls","controls");

		var audiosource = document.createElement("source");
		audiosource.setAttribute("src",content);
		audiosource.setAttribute("type","audio/mpeg");

		audio.appendChild(audiosource);
		block.appendChild(audio);
	} else if(btype === "video") {
		var video = document.createElement("video");
		video.setAttribute("class","xVid");
		video.volume = 0.8;
		video.setAttribute("controls","controls");

		var videosource = document.createElement("source");
		videosource.setAttribute("src",content);
		videosource.setAttribute("type","video/mp4");

		video.appendChild(videosource);
		block.appendChild(video);
	} else if (btype === "xsvgs") {
		var xsvgs = document.createElement("div");
		xsvgs.setAttribute("class","xSvg");
		xsvgs.setAttribute("data-link",content);

		if(content !== "") {
			getLocalLinkContent(content).then(function(svgdata) {
				/* remove the first line, which is just a DOCTYPE tag */
				var svgArray = svgdata.split("\n");
				xsvgs.innerHTML = svgArray[1];
			},function(error) {
				/* don't load anything on error */
			});
		}

		block.appendChild(xsvgs);
	} else if(btype === "slide") {

		/* data-page attribute keeps track of which page is being displayed */
		var canvas = document.createElement("canvas");
		canvas.setAttribute("class","xSli");
		canvas.setAttribute("id",content);
		canvas.setAttribute("data-page","1");

		block.appendChild(canvas);

		/* if block was just made, don't try to load pdf */
		if (content !== "") {
			PDFJS.getDocument(content).then(function(pdfObj) {
				pdfObjects[content] = pdfObj;

				var tag = block.childNodes[0];

				renderPDF(pdfObj,1,tag);
			});
		}

		/* event listener for changing slides left & right */
		block.onmouseup = function(event) {
			var X = event.pageX - this.offsetLeft;
			/// var Y = event.pageY - this.offsetTop;

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
			} else {
				if(pageNum > 1) {
					pageNum--;
					canvas.setAttribute("data-page",pageNum);
					renderPDF(pdfObjects[pdfID],pageNum,canvas);
				}
			}
		};
	} else if(btype === "title") {

		var str = '<input type="text" class="xTit" maxlength="64" value="' + deparseBlock(btype,content) + '">';
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

	/* p : plain */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 80) {
		iframe.contentDocument.execCommand('removeFormat',false,null);
	}
    /* b : bold */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 66) {
		iframe.contentDocument.execCommand('bold',false,null);
	}
	/* i : italics */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 73) {
		iframe.contentDocument.execCommand('italic',false,null);
	}
	/* h : highlight */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 72) {
		iframe.contentDocument.execCommand('backColor',false,"yellow");
	}
	/* l : list */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 76) {
		iframe.contentDocument.execCommand('insertUnorderedList',false,null);
	}
	/* + : superscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 187) {
		iframe.contentDocument.execCommand('superscript',false,null);
	}
	/* - : subscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 189) {
		iframe.contentDocument.execCommand('subscript',false,null);
	}
	/* j : justify left */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 74) {
		iframe.contentDocument.execCommand('justifyLeft',false,null);
	}
	/* f : justify full */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 70) {
		iframe.contentDocument.execCommand('justifyFull',false,null);
	}
	/* tab : indent */
	if(event.keyCode === 9) {
		iframe.contentDocument.execCommand('insertHTML',false,'&nbsp;&nbsp;&nbsp;&nbsp;');
	}
	/* a - anchor */
	if(event.shiftKey && event.ctrlKey && event.keyCode === 65) {
		var callback = function(event,str) {
			if(event) {
				if (str.indexOf("http://") < 0 && str.indexOf("https://") < 0) {
					iframe.contentDocument.execCommand('createLink',false,"http://" + str);
				} else if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
					iframe.contentDocument.execCommand('createLink',false,str);
				} else {
					alertify.log("Not A Valid Link!","error");
				}
			} else { /* cancel */ }
		};
		alertify.prompt('Enter the link: ',callback,'http://');
	}

	/* Command + letter, works for these, but include for consistency */
	/* x : cut */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 88) {
		iframe.contentDocument.execCommand('cut',false,null);
	}
	/* c : copy */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 67) {
		iframe.contentDocument.execCommand('copy',false,null);
	}
	/* v : paste */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 86) {
		iframe.contentDocument.execCommand('paste',false,null);
	}
	/* z : undo */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 90) {
		iframe.contentDocument.execCommand('undo',false,null);
	}
	/* y : redo */
    if(event.shiftKey && event.ctrlKey && event.keyCode === 89) {
		iframe.contentDocument.execCommand('redo',false,null);
	}

	/// is this necessary ??
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

	/// notify the user if they have surpassed our limit
	if(block.textContent.length > 1024) {
		alertify.alert("There is too much in this code block. The block will not save correctly. Please remove some of its content.");
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

	/// I have no idea what scale does, but it's needed
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

		renderTask.promise.then(function() {
			/// update stuff here, page has been rendered
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
	buttonDiv.setAttribute('class','blockbtns');
	buttonDiv.setAttribute('id','b' + bid);

	/* the following are all of the buttons */

	var txtBtn = document.createElement('button');
	txtBtn.setAttribute("onclick","addBlock(" + bid + ",'xtext')");
	txtBtn.setAttribute("class","blockbtn addbtn");
	txtBtn.innerHTML = "text";

	var cdeBtn = document.createElement('button');
	cdeBtn.setAttribute("onclick","addBlock(" + bid + ",'xcode')");
	cdeBtn.setAttribute("class","blockbtn addbtn");
	cdeBtn.innerHTML = "code";

	var matBtn = document.createElement('button');
	matBtn.setAttribute("onclick","addBlock(" + bid + ",'xmath')");
	matBtn.setAttribute("class","blockbtn addbtn");
	matBtn.innerHTML = "math";

	var ltxBtn = document.createElement('button');
	ltxBtn.setAttribute("onclick","addBlock(" + bid + ",'latex')");
	ltxBtn.setAttribute("class","blockbtn addbtn");
	ltxBtn.innerHTML = "latex";

	var imgBtn = document.createElement('button');
	imgBtn.setAttribute("onclick","addBlock(" + bid + ",'image')");
	imgBtn.setAttribute("class","blockbtn addbtn");
	imgBtn.innerHTML = "image";

	var audBtn = document.createElement('button');
	audBtn.setAttribute("onclick","addBlock(" + bid + ",'audio')");
	audBtn.setAttribute("class","blockbtn addbtn");
	audBtn.innerHTML = "audio";

	var vidBtn = document.createElement('button');
	vidBtn.setAttribute("onclick","addBlock(" + bid + ",'video')");
	vidBtn.setAttribute("class","blockbtn addbtn");
	vidBtn.innerHTML = "video";

	var sliBtn = document.createElement('button');
	sliBtn.setAttribute("onclick","addBlock(" + bid + ",'slide')");
	sliBtn.setAttribute("class","blockbtn addbtn");
	sliBtn.innerHTML = "slides";

	var svgBtn = document.createElement('button');
	svgBtn.setAttribute("onclick","addBlock(" + bid + ",'xsvgs')");
	svgBtn.setAttribute("class","blockbtn addbtn");
	svgBtn.innerHTML = "svg";

	var titBtn = document.createElement('button');
	titBtn.setAttribute("onclick","addBlock(" + bid + ",'title')");
	titBtn.setAttribute("class","blockbtn addbtn");
	titBtn.innerHTML = "title";

	var delBtn = document.createElement('button');
	delBtn.setAttribute('id','d' + bid);
	delBtn.setAttribute('onclick','deleteBlock(' + bid + ')');
	delBtn.setAttribute("class","blockbtn delbtn");
	delBtn.style.visibility = 'hidden';
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
	/// buttonDiv.appendChild(svgBtn);
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
function makeSpace(bid,count) {
	var track = count;
	while(bid < track) {
		/* change blocks to this value */
		var next = track + 1;

		/* replace the button IDs */
		var buttons = blockButtons(next);
		document.getElementById('b' + track).parentNode.replaceChild(buttons,document.getElementById('b' + track));

		/* replace the content block id */
		document.getElementById('a' + track).setAttribute('id','a' + next);

		/* replace the block id */
		document.getElementById(track).setAttribute('id',next);

		/* update the count */
		track--;
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
	group.setAttribute('class','block');
	group.setAttribute('id',bid);

	/* append the content block & buttons div to the block div */
	group.appendChild(block);
	group.appendChild(buttons);

	/* find the location to insert the block and insert it */
	if(bid <= count) {
		var position = document.getElementById('blocks').children[bid];
		document.getElementById('blocks').insertBefore(group,position);
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
function createBlock(cbid,btype) {

	var blockCount = countBlocks();

	/* make space if inserting block, if appending block, ignore */
	if(cbid < blockCount) {
		makeSpace(cbid,blockCount);
	}

	/* create and insert block */
	var bid = cbid + 1;

	var content = "";

	var block = insertContent(bid,btype,content);
	var blockbuttons = blockButtons(bid);
	insertBlock(block,blockbuttons,bid,blockCount);

	/* make delete buttons visible */
	var i = 0;
	while(i <= blockCount) {
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
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

	if(btype === "xtext") {
		/* xtext calls createBlock() to add the block. Then the iframe must be put into designMode */
		createBlock(bid,btype);

		/* grab the block iframe that was just made */
		var block = document.getElementById("a" + (bid + 1)).childNodes[0];
		var blockDoc = block.contentDocument;

		/* make iframe editable */
		blockDoc.designMode = "on";

		/* save blocks to temp table, indicated by false */
		saveBlocks(false);
	} else if (["xcode","xmath","latex","title"].indexOf(btype) > -1) {
		/* these blocks call createBlock() to add the block */
		createBlock(bid,btype);

		/* save blocks to temp table, indicated by false */
		saveBlocks(false);
	} else if (["image","audio","video","slide","xsvgs"].indexOf(btype) > -1) {
		/* these blocks call uploadMedia() which uploads media and then calls createBlock() */
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
function closeSpace(cbid,count) {
	var bid = cbid;
	while(bid < count) {
		/* change blocks to this value */
		var next = bid + 1;

		/* replace the button IDs */
		var buttons = blockButtons(bid);
		document.getElementById('b' + next).parentNode.replaceChild(buttons,document.getElementById('b' + next));

		/* replace the content block id */
		document.getElementById('a' + next).setAttribute('id','a' + bid);

		/* replace the block id */
		document.getElementById(next).setAttribute('id',bid);

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
function deleteBlock(cbid) {
	var blockCount = countBlocks();

	var bid = cbid + 1;

	/* delete the block */
	removeBlock(bid);

	/* close space if removing block from middle, otherwise ignore */
	if(bid < blockCount) {
		closeSpace(bid,blockCount);
	}

	/* make delete buttons visible & last button invisible */
	var i = 0;
	blockCount = countBlocks();
	while(i < blockCount) {
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
	document.getElementById('d' + i).style.visibility = 'hidden';

	/* save blocks to temp table, indicated by false */
	saveBlocks(false);
}

// <<<fold>>>

/***
	Section: Ajax Functions
	These are functions to retrieve data from the back-end.
***/

// <<<code>>>

/*
   Function: autosaveTimer

   Display the autosave timer on the page.

   Parameters:

      div - html div, the div that will contain the timer

   Returns:

      Nothing.
*/
function autosaveTimer(asdiv) {

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
					saveBlocks(true);
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
   Function: getLocalLinkContent

   Use this to get the text from a local file link.

   Parameters:

      url - string, the url of the file link to fetch

   Returns:

      Promise - on error: "err", on success: string, text data
*/
function getLocalLinkContent(link) {

	/* wrap the ajax request in a promise */
	var promise = new Promise(function(resolve,reject) {
		/* create the url destination for the ajax request */
		var url = createURL("/" + link);

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("GET",url,true);

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
					reject("err");
				}
			}
		};

		xmlhttp.send();
	});

	return promise;
}

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
	Function: revertBlocks

	This function loads the page with last permanent save data.

	Parameters:

		none

	Returns:

		nothing - *
*/
function revertBlocks() {
	/* create the url destination for the ajax request */
	var url = createURL("/revert");

	/* get the pid & page name */
	var pid = document.getElementsByName('pageid')[0].value;
	var pagename = document.getElementsByName('pagename')[0].value;

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "pid=" + pid;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "nopid") {
					alertify.alert("This Page Is Not Meant To Be Visited Directly.");
				} else if (xmlhttp.responseText === "norevertloggedout") {
					alertify.alert("Revert Error. You Are Not Logged In.");
				} else if (xmlhttp.responseText === "err") {
					alertify.alert("An Error Occured. Please Try Again Later");
				} else {
					emptyDiv("content");
					pageEdit(pid + "," + pagename + xmlhttp.responseText);
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
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

	/* set parameter to be sent to back-end that determines which table to save to, temp or perm, & set save status display */
	var table;
	if(which === false) {
		table = 0;
		document.getElementById("savestatus").innerHTML = "Not Saved";
	} else {
		table = 1;
		document.getElementById("savestatus").innerHTML = "Saved";
	}

	document.getElementsByName('statusid')[0].setAttribute('value',table);

	/* variables for storing block data */
	var blockType = [];
	var blockContent = [];

	var blockCount = countBlocks();
	var bid = 1;

	/* get the block types & contents */
	if(blockCount > 0) {
		var i = 0;
		while(blockCount >= bid) {
			/* get the block type */
			var btype = document.getElementById('a' + bid).className;
			blockType[i] = btype;

			/* grab block content based on block type */
			if (btype === "xtext") {

				/* execCommand() applies style tags to <body> tag inside <iframe>, hence .getElementsByTagName('body')[0] */
				blockContent[i] = document.getElementById('a' + bid).children[0].contentDocument.getElementsByTagName('body')[0].innerHTML;
				blockContent[i] = parseBlock(btype,blockContent[i]);
			} else if (btype === "xcode") {
				blockContent[i] = document.getElementById('a' + bid).children[0].innerHTML;
				blockContent[i] = parseBlock(btype,blockContent[i]);
			} else if (btype === "latex" || btype === "xmath") {
				/* replace() is for escaping backslashes */
				blockContent[i] = document.getElementById('a' + bid).children[1].innerHTML.replace(/\\/g,"\\\\");
				blockContent[i] = parseBlock(btype,blockContent[i]);
			} else if (btype === "image") {
				var imagestr = document.getElementById('a' + bid).children[0].src;
				blockContent[i] = imagestr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
			} else if (btype === "audio" || btype === "video") {
				var mediastr = document.getElementById('a' + bid).children[0].children[0].src;
				blockContent[i] = mediastr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
			} else if (btype === "xsvgs") {
				var svgstr = document.getElementById('a' + bid).childNodes[0].getAttribute("data-link");
				blockContent[i] = svgstr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
			} else if (btype === "slide") {
				var slidestr = document.getElementById('a' + bid).children[0].id;
				blockContent[i] = slidestr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
			} else if (btype === "title") {
				blockContent[i] = document.getElementById('a' + bid).children[0].value;
				blockContent[i] = parseBlock(btype,blockContent[i]);
			}

			i++;
			bid++;
		}

		/* merge mediaType & mediaContent arrays into default comma-separated strings */
		var types = blockType.join();
		var contents = blockContent.join();
	}

	/* create the url destination for the ajax request */
	var url = createURL("/saveblocks");

	/* get pagename & pageid */
	var pid = document.getElementsByName('pageid')[0].value;
	var pagename = document.getElementsByName('pagename')[0].value;

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	/* if this is temp save, don't show saving progress */
	if(which !== false) {
		xmlhttp.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				progressUpdate(e.loaded);
			}
		};
		xmlhttp.upload.onloadstart = function(e) {
			progressInitialize("Saving...",e.total);
		};
		xmlhttp.upload.onloadend = function(e) {
			progressFinalize("Saved",e.total);
		};
	}

	var params = "mediaType=" + types + "&mediaContent=" + contents + "&pid=" + pid + "&pagename=" + pagename + "&tabid=" + table;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "blockssaved") {
						/// successful save
					} else if (xmlhttp.responseText === "nosaveloggedout") {
						alertify.alert("You Can't Save This Page Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again.");
					} else {
						alertify.alert("An Unknown Save Error Occurred");
					}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

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

	/* change file-select to only accept files based on btype */
	switch(btype) {
		case "image":
			fileSelect.setAttribute("accept",".bmp,.bmp2,.bmp3,.jpeg,.jpg,.pdf,.png,.svg");
			break;
		case "audio":
			fileSelect.setAttribute("accept",".aac,.aiff,.m4a,.mp3,.ogg,.ra,.wav,.wma");
			break;
		case "video":
			fileSelect.setAttribute("accept",".avi,.flv,.mov,.mp4,.mpeg,.ogg,.rm,.webm,.wmv");
			break;
		case "xsvgs":
			fileSelect.setAttribute("accept",".svg");
			break;
		case "slide":
			fileSelect.setAttribute("accept",".pdf,.ppt,.pptx,.pps,.ppsx");
			break;
		default:
			fileSelect.setAttribute("accept","");
	}

	/* uploadMedia() is called when a block button is pressed, to show file select pop-up box, force click the file-select object */
	fileSelect.click();

	/* only upload media when a file select change has occurred, this prevents an empty block creation if the user presses 'cancel' */
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
			console.log("nofile");
		} else if(notvalid) {
			alertify.alert(errorMsg);
		} else {
			/* create the block to host the media */
			createBlock(bid - 1,btype);

			/* wrap the ajax request in a promise */
			var promise = new Promise(function(resolve,reject) {

				/* create javascript FormData object and append the file */
				var formData = new FormData();
				formData.append('media',file,file.name);

				/* get the page id */
				var pid = document.getElementsByName('pageid')[0].value;

				/* grab the domain and create the url destination for the ajax request */
				var url = createURL("/uploadmedia?pid=" + pid + "&btype=" + btype);

				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open('POST',url,true);

				/* upload progress */
				xmlhttp.upload.onloadstart = function(e) {
					progressInitialize("Uploading...",e.total);
				};
				xmlhttp.upload.onprogress = function(e) {
					if (e.lengthComputable) {
						progressUpdate(e.loaded);
					}
				};
				xmlhttp.upload.onloadend = function(e) {
					progressFinalize("Uploaded",e.total);
				};

				function counter(reset) {
					if(typeof counter.track === 'undefined' || counter.track === 0) {
						counter.track = 1;
						return 1;
					} else if(reset) {
						counter.track = 0;
						return 0;
					} else {
						counter.track++;
					}
					return counter.track;
				}

				function position(spot) {
					if(typeof position.prev === 'undefined') {
						position.prev = 0;
						position.curr = spot;
					} else if (position.curr !== spot) {
						position.prev = position.curr;
						position.curr = spot;
					}
					return [position.prev,position.curr];
				}

				/* conversion progress */
				xmlhttp.onprogress = function(e) {
					var spotArray = position(xmlhttp.responseText.length);
					var current = counter(false);
					var val = xmlhttp.responseText.slice(spotArray[0],spotArray[1]).split(",");
					if(current === 1) {
						progressInitialize("Converting...",val[val.length - 1]);
					} else {
						progressUpdate(val[val.length - 1]);
					}
				};
				xmlhttp.onloadend = function(e) {
					var spotArray = position(xmlhttp.responseText.length);
					var val = xmlhttp.responseText.slice(spotArray[0],spotArray[1]).split(",");
					progressFinalize("Not Saved",val[val.length - 1]);
					counter(true);
				};

				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState === XMLHttpRequest.DONE) {
						if(xmlhttp.status === 200) {
							if(xmlhttp.responseText === "err") {
								reject("err");
							} else if(xmlhttp.responseText === "convertmediaerr") {
								reject("convertmediaerr");
							} else if (xmlhttp.responseText === "nouploadloggedout") {
								deleteBlock(bid - 1);
								alertify.alert("You Can't Upload Media Because You Are Logged Out. Log Back In On A Separate Page, Then Return Here & Try Again.");
								reject("err");
							} else {
								var spotArray = position(xmlhttp.responseText.length);
								var val = xmlhttp.responseText.slice(spotArray[0],spotArray[1]).split(",");
								/* reset position */
								position(0); position(0);
								resolve(val[val.length - 1]);
							}
						} else {
							alertify.alert('Error:' + xmlhttp.status + ": Please Try Again");
							reject("err");
						}
					}
				};

				xmlhttp.send(formData);
			});

			promise.then(function(success) {

				/* set the image source */
				if (btype === "image") {
					var imagetag = document.getElementById('a' + bid).childNodes[0];
					imagetag.src = success;
				} else if(btype === "audio" || btype === "video") {
					/* audio & video divs have their src set in an extra child node */
					var mediatag = document.getElementById('a' + bid).childNodes[0].childNodes[0];
					mediatag.src = success;
					mediatag.parentNode.load();
				} else if (btype === "xsvgs") {
					/* load the svg file's contents into the block */
					var svgtag = document.getElementById('a' + bid).childNodes[0];
					svgtag.setAttribute("data-link",success);
					getLocalLinkContent(success).then(function(svgdata) {
						/* remove the first line, which is just a DOCTYPE tag */
						var svgArray = svgdata.split("\n");
						svgtag.innerHTML = svgArray[1];
					},function(error) {
						/* don't load anything on error */
					});
				} else if(btype === "slide") {
					/* add the pdf to the pdfObjects array and render the first page */
					PDFJS.getDocument(success).then(function(pdfObj) {

						pdfObjects[success] = pdfObj;

						var slidetag = document.getElementById('a' + bid).childNodes[0];
						slidetag.setAttribute("id",success);

						renderPDF(pdfObj,1,slidetag);
					});
				}

				/* save blocks to temp table, indicated by false */
				saveBlocks(false);

			},function(error) {
				if(error === "convertmediaerr") {
					alertify.log("There was an error with that media format. Please try a different file type.");
				} else {
					console.log("uploadMedia() promise error");
				}
			});
		}
		/* this resets the selection to nothing, in case the user decides to upload the same file, onchange will still fire */
		this.value = null;
	};
}

// <<<fold>>>
