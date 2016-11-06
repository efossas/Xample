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
		var rows = content.split('@@');
		var count = rows.length;

		var linkDiv = document.createElement('div');
		linkDiv.setAttribute('class','xLrg');

		for(var i = 0; i < count; i++) {
			var newLinkBtn = document.createElement('a');
			newLinkBtn.setAttribute('class','inbtn delbtn');
			newLinkBtn.setAttribute('onclick','delLink(this)');
			newLinkBtn.innerHTML = '-';

			var newLinkBtnDiv = document.createElement('div');
			newLinkBtnDiv.setAttribute('class','col col-10');
			newLinkBtnDiv.appendChild(newLinkBtn);

			var newLinkInput = document.createElement('input');
			newLinkInput.setAttribute('class','xLrg');
			newLinkInput.setAttribute('type','text');
			newLinkInput.maxlength = 64;

			var data = rows[i].split('$');
			if(data.length === 1) {
				newLinkInput.value = '';
			} else {
				newLinkInput.value = 'pg=' + data[0] + '&ui=' + data[1];
			}

			var newLinkInputDiv = document.createElement('div');
			newLinkInputDiv.setAttribute('class','col col-90');
			newLinkInputDiv.appendChild(newLinkInput);

			var newLinkDiv = document.createElement('div');
			newLinkDiv.setAttribute('class','row');
			newLinkDiv.appendChild(newLinkBtnDiv);
			newLinkDiv.appendChild(newLinkInputDiv);

			linkDiv.appendChild(newLinkDiv);
		}

		/* the add link btn */
		var addLinkBtn = document.createElement('a');
		addLinkBtn.setAttribute('class','inbtn addbtn');
		addLinkBtn.setAttribute('onclick','addLink(this)');
		addLinkBtn.innerHTML = '+';

		var addLinkBtnDiv = document.createElement('div');
		addLinkBtnDiv.setAttribute('class','col col-10');
		addLinkBtnDiv.appendChild(addLinkBtn);

		var addLinkFillDiv = document.createElement('div');
		addLinkFillDiv.setAttribute('class','col col-90');

		linkDiv.appendChild(addLinkBtnDiv);
		linkDiv.appendChild(addLinkFillDiv);

		block.appendChild(linkDiv);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		/* append necessary functions to body */
		function delLink(btn) {
			btn.parentNode.parentNode.parentNode.removeChild(btn.parentNode.parentNode);
		}

		function addLink(btn) {
			var newLinkBtn = document.createElement('a');
			newLinkBtn.setAttribute('class','inbtn delbtn');
			newLinkBtn.setAttribute('onclick','delLink(this)');
			newLinkBtn.innerHTML = '-';

			var newLinkBtnDiv = document.createElement('div');
			newLinkBtnDiv.setAttribute('class','col col-10');
			newLinkBtnDiv.appendChild(newLinkBtn);

			var newLinkInput = document.createElement('input');
			newLinkInput.setAttribute('class','xLrg');
			newLinkInput.setAttribute('type','text');
			newLinkInput.maxlength = 64;

			var newLinkInputDiv = document.createElement('div');
			newLinkInputDiv.setAttribute('class','col col-90');
			newLinkInputDiv.appendChild(newLinkInput);

			var newLinkDiv = document.createElement('div');
			newLinkDiv.setAttribute('class','row');
			newLinkDiv.appendChild(newLinkBtnDiv);
			newLinkDiv.appendChild(newLinkInputDiv);

			btn.parentNode.parentNode.insertBefore(newLinkDiv,btn.parentNode);
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = String(delLink) + String(addLink);
		document.body.appendChild(script);
	};

	this.saveContent = function(bid) {
		var linkContent = [];

		var rows = document.getElementById('a' + bid).children[0].children;
		var count = rows.length;
		for(var i = 0; i < count; i++) {
			if(rows[i].getAttribute('class') === 'row') {
				var current = rows[i].children[1].children[0].value;

				/* if empty, ignore saving this input */
				if(current !== "") {
					var pgRegEx = /pg=([0-9]+)/;
					var pg = pgRegEx.exec(current);

					var uiRegEx = /ui=([0-9]+)/;
					var ui = uiRegEx.exec(current);

					if(pg === null || ui === null) {
						/// HANDLE INVALID LINKS
					} else {
						linkContent.push(pg[1] + '$' + ui[1]);
					}
				}
			}
		}
		var blockContent = linkContent.join("@@");

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

	/*** AFTER STUFF ***/

	/* start auto save timer */
	autosaveTimer(document.getElementById("autosave"),function() {
		return saveBlocks(true);
	});

	/* prevent user from exiting page if Revert or Save has not been clicked */
	window.onbeforeunload = function() {
		var status = document.getElementById("statusid").value;
		if(status === '0') {
			/// this text isn't being displayed... some default is instead
			return "Please click Revert or Save before exiting.";
		}
		return null;
	};
}

// <<<fold>>>
