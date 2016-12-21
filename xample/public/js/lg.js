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
	global barSubMenu:true
	global barStatus:true
	global getUserFields:true
	global watermark:true
*/
/* from bengine.js */
/*
	global x:true
	global globalBlockEngine:true
	global blockButtons:true
	global blockContentShow:true
	global blockEngineStart:true
	global generateBlock: true
	global countBlocks: true
	global saveBlocks: true
	global parseBlock: true
	global deparseBlock: true
	global barPageSettings: true
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
				newLinkInput.value = 'p=' + data[0] + '&a=' + data[1];
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
		if(!document.getElementById('xlist-functions')) {
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
			script.id = 'xlist-functions';
			script.text = String(delLink) + String(addLink);
			document.body.appendChild(script);
		}
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
					var pgRegEx = /p=([0-9]+)/;
					var pg = pgRegEx.exec(current);

					var aiRegEx = /a=([0-9]+)/;
					var ai = aiRegEx.exec(current);

					if(pg === null || ai === null) {
						/// HANDLE INVALID LINKS
					} else {
						linkContent.push(pg[1] + '$' + ai[1]);
					}
				}
			}
		}
		var blockContent = linkContent.join("@@");

		return parseBlock(this.type,blockContent);
	};
};

// <<<fold>>>

function barGuide(chcount,guidedata) {
	var guide = document.createElement('div');
	guide.setAttribute('class','guide-bar');

	var guideselect = document.createElement('div');
	guideselect.setAttribute('class','guide-box');

	function listSelect(evt) {
		var aid = this.getAttribute('data-aid');
		var xid = this.getAttribute('data-xid');

		var blockFrame = document.getElementById('blockpage');
		blockFrame.src = 'page?a=' + aid + '&p=' + xid + '&m=false';
	}

	function listHover(evt) {
		this.style = 'background-color:rgba(58, 50, 200, 0.2)';
	}

	function listOff(evt) {
		this.style = 'background-color:transparent';
	}

	var listCount = guidedata.length;
	for(var i = 0; i < listCount; i++) {
		var row = document.createElement('div');

		switch(i) {
			case 0:
				row.setAttribute('class','row toprow'); break;
			case listCount - 1:
				row.setAttribute('class','row bottomrow'); break;
			default:
				row.setAttribute('class','row');
		}

		row.setAttribute('data-aid',guidedata[i].aid);
		row.setAttribute('data-xid',guidedata[i].xid);

		/* left buffer */
		var colLeft = document.createElement('div');
		colLeft.setAttribute('class','col col-2');

		/* page position in list */
		var colPgNum = document.createElement('div');
		colPgNum.setAttribute('class','col col-3 padtop');
		colPgNum.innerHTML = (i + 1);

		/* page thumbnail */
		var colImg = document.createElement('div');
		colImg.setAttribute('class','col col-6');

		var thumb = document.createElement('img');
		thumb.src = guidedata[i].imageurl;

		colImg.appendChild(thumb);

		/* page name */
		var colName = document.createElement('div');
		colName.setAttribute('class','col col-67 padtop');
		colName.innerHTML = guidedata[i].xname;

		/* page author */
		var colAuthor = document.createElement('div');
		colAuthor.setAttribute('class','col col-20 padtop');
		colAuthor.setAttribute('style','text-align:right');
		colAuthor.innerHTML = guidedata[i].username;

		/* right buffer */
		var colRight = document.createElement('div');
		colRight.setAttribute('class','col col-2');

		/* append everything */
		row.appendChild(colLeft);
		row.appendChild(colPgNum);
		row.appendChild(colImg);
		row.appendChild(colName);
		row.appendChild(colAuthor);
		row.appendChild(colRight);

		row.addEventListener('click',listSelect,true);
		row.addEventListener('mouseover',listHover,true);
		row.addEventListener('mouseout',listOff,true);

		guideselect.appendChild(row);
	}

	guide.appendChild(guideselect);

	return guide;
}

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
function pageEditLG(aid,guidedata,guideinfo) {

	/* grab the main div */
	var main = document.getElementById('content');

	/* hidden pid & title */
	var gid = guideinfo.id;
	var guidename = guideinfo.name;

	/*** MENU & STATUS BAR ***/

	/* create menu & status bar */
	var menu = barMenu();
	var status = barStatus(gid);

	var guideSettings = barPageSettings('guide',aid,guideinfo);

	/* create submenu */
	var submenu = barSubMenu('Guide Settings',guideSettings);

	/* append menu & status to main */
	main.appendChild(menu);
	main.appendChild(status);
	main.appendChild(submenu);

	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(guidedata !== "") {
		blockarray = guidedata.split(',');
	} else {
		blockarray = [];
	}

	blockEngineStart('content',x,["guide",gid,'t'],blockarray);

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

/*
	Function: pageShowGuide

	This function loads guide data in show mode.

	Parameters:

		chcount - number, the number of guide chapters in the guide
		guidedata - json string, array of objects containing page data like name,author,chapter,image url

	Returns:

		nothing - *
*/
function pageShowGuide(chcount,guidedata) {
	/* grab the main div */
	var main = document.getElementById('content');

	/* watermark */
	main.appendChild(watermark());

	/*** MENU BAR ***/

	/* create menu & status bar */
	var menu = barMenu();

	/* append menu & status to main */
	main.appendChild(menu);

	/* parse through guide obj & create guide/chapters */
	var guideobj = JSON.parse(guidedata);

	var guide = barGuide(chcount,guideobj);

	main.appendChild(guide);

	/* space div in between guide & page display */
	var spaceDiv = document.createElement('div');
	spaceDiv.setAttribute('style','padding-bottom:20px;');
	main.appendChild(spaceDiv);

	/* div for displaying block page */
	var blockDisplay = document.createElement('div');
	blockDisplay.setAttribute('id','block-display');
	blockDisplay.setAttribute('class','block-display');

	function reFrame() {
		this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
	}

	var blockFrame = document.createElement('iframe');
	blockFrame.setAttribute('id','blockpage');
	blockFrame.setAttribute('frameborder','0');
	blockFrame.setAttribute('scrolling','no');
	blockFrame.addEventListener('load',reFrame);
	blockDisplay.appendChild(blockFrame);

	main.appendChild(blockDisplay);
}

// <<<fold>>>
