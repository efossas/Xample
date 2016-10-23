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
	global generateBlock: true
	global countBlocks: true
	global saveBlocks: true
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
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

// <<<fold>>>

/***
	Section: Display Functions
	These are functions to create, remove, or show page elements.
***/

// <<<code>>>

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

	/* MENU & STATUS BAR */

	var menu = barMenu();
	var status = barStatus();

	/*** BLOCKS ***/

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','blocks');
	blocksdiv.setAttribute('id','blocks');

	/* initial first block buttons */
	var buttons = blockButtons(0);
	blocksdiv.appendChild(buttons);

	/// NEED A SECTION HERE FOR PARSING guidedata INTO blocksdiv

	/* MAIN */

	var main = document.getElementById("content");
	main.appendChild(menu);
	main.appendChild(status);
	main.appendChild(blocksdiv);
}

// <<<fold>>>

/***
	Section: Block Functions
	These are functions that handle the block generator
***/

// <<<code>>>

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

	var lisBtn = document.createElement('button');
	lisBtn.setAttribute("onclick","addBlock(" + bid + ",'xlist')");
	lisBtn.setAttribute("class","blockbtn addbtn");
	lisBtn.innerHTML = "list";

	var delBtn = document.createElement('button');
	delBtn.setAttribute('id','d' + bid);
	delBtn.setAttribute('onclick','deleteBlock(' + bid + ')');
	delBtn.setAttribute("class","blockbtn delbtn");
	delBtn.style.visibility = 'hidden';
	delBtn.innerHTML = "&darr;";

	/* append the buttons to the div that holds them */
	buttonDiv.appendChild(lisBtn);
	buttonDiv.appendChild(delBtn);

	return buttonDiv;
}

// <<<fold>>>
