/* eslint-env browser, es6 */
/*****
	Title: Learning Guide
	This is the front-end for Xample Learning Guides
*****/

/***
	Section: Globals
	These are the global variables xample uses

	pdfObjects - pdf.js generates pdf objects that can be used to render individual pages to <canvas>
	globalScope - attach needed global variables as properties to this object
***/

// <<<code>>>

/* from omni.js */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
	global btnLink:true
	global btnSubmit:true
	global barMenu:true
	global barStatus:true
	global getUserFields:true
*/
/* from bengine.js */
/*
	global x:true
	global globalBlockEngine:true
	global blockButtons:true
	global blockEngineStart:true
	global generateBlock: true
	global countBlocks: true
	global saveBlocks: true
	global parseBlock: true
	global deparseBlock: true
*/
/* list any objects js dependencies */
/*
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

x.xlist = new function xlist() {
	this.type = "xlist";
	this.name = "list";
	this.upload = false;

	this.insertContent = function(block,content) {
		var str = '<input type="text" class="xLrg" maxlength="64" value="' + deparseBlock(this.type,content) + '">';
		block.innerHTML = str;

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		/* nothing to do */
	};

	this.saveContent = function(bid) {
		var blockContent = document.getElementById('a' + bid).children[0].value;
		return parseBlock(this.type,blockContent);
	};
};

// <<<fold>>>

/***
	Section: Page Functions
	These are functions loading pages.
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

	/* grab the main div */
	var main = document.getElementById('content');

	/* block array -> pid,pagename,mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray = guidedata.split(',');

	/* hidden pid & title */
	var gid = blockarray[0];
	var guidename = blockarray[1];

	/* MENU & STATUS BAR */

	var menu = barMenu();
	var status = barStatus(gid);

	/* append menu & status to main */
	main.appendChild(menu);
	main.appendChild(status);

	/* page title input */
	var title = document.createElement('input');
	title.setAttribute('type','text');
	title.setAttribute('name','pagename');
	title.setAttribute('class','page-title');
	title.setAttribute('maxlength','50');
	title.setAttribute('value',guidename);
	title.setAttribute('style','display: none;');
	menu.appendChild(title);

	/// PAGE OPTIONS NEED TO BE ADDED HERE

	/*** BLOCKS ***/

	blockEngineStart('content',x,["lg",gid],blockarray.splice(2,blockarray.length));

	/// NEED A SECTION HERE FOR PARSING guidedata INTO blocksdiv

}

// <<<fold>>>
