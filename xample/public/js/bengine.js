/* eslint-env browser, es6 */
/******
	Title: Block Engine
	This is the front-end for the Block Engine.
******/

/* list any objects js dependencies */
/*
	global alertify:true
*/

var extensibles = {},
funcs = {},
options = {};

function Bengine(extensibles,funcs,options) {

/***
	Section: Defaults

	extensibles - used to store extensible blocks. hence, extensibles.newBlock should be an object that contains all of the necessary methods for block execution.
***/

this.extensibles = extensibles;

var g_bengine = {};
g_bengine.main = "";

options.blockLimit = options.blockLimit || 8;
options.enableSave = (options.enableSave !== false);
options.enableSingleView = options.enableSingleView || false;
options.mediaLimit = options.mediaLimit || 100; // mb
options.playableMediaLimit = options.playableMediaLimit || 180; // seconds
options.swidth = options.swidth || "900px";

/***
	Section: Start Up Code
	Any necessary start up code for Bengine goes here.
***/

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `.bengine-block-style {
}
.bengine-instance {
	overflow: hidden;
}
.bengine-block-style-embed {
	height: 85vh !important;
	margin: 0 !important;
}
.bengine-x-blocks {

}
.bengine-single-view {
	width: 100%;
	height: 15vh;
	position: absolute;
	bottom: 0;
	right: 0;
}
.bengine-btn-embed {
	border: 0;
	color: black;
	float: left;
	width: 100%;
	height: 100%;
	padding: 0px 30px;
	text-align: center;
	cursor: pointer;
	transition: background-color .5s;
	touch-action: manipulation;
	font-size: 1em;
	font-weight: 400;
}
.bengine-btn-color {
	background-color: rgb(0, 0, 0);
	color: white;
	font-size: 1.3em;
}
.bengine-btn-color:hover {
	background-color: rgba(0, 0, 0, 0.6);
	color: black;
}
.bengine-block {
	margin: 0;
	padding: 0;
}
.bengine-blockbtns {
	max-width: $site-width;
	margin: 50px auto 0px auto;
	position: relative;
}

.bengine-blockbtn {
	color: black;
	border: 1px solid transparent;
	border-color: black;
	border-radius: 2px;

	width: 100%;

	padding: 6px 12px;
	text-align: center;

	cursor: pointer;
	transition: background-color .5s;
	touch-action: manipulation;

	font-size: 1em;
	font-weight: 400;
}
.addbtn {
	background-color: #c8fff9;
}
.addbtn:hover {
	background-color: #82dad0;
}
.delbtn {
	background-color: #ff1818;
}
.delbtn:hover {
	background-color: #a81313;
}
@media screen and (max-width: ${options.swidth}) {
    .bengine-blockbtns { width: 100%; }
	.bengine-blockbtn { width: 100%; }
`;
document.getElementsByTagName('head')[0].appendChild(style);

/***
	Section: Replaceable Functions
	These functions are essentially helper functions that can be replaced by custom functions passed into Bengine.
***/

// <<<code>>>

/*
	Function: emptyDiv

	Remove div contents.

	Parameters:

		node - The element whose contents will be cleared

	Returns:

		nothing - *
*/
var emptyDiv = function(node) {
	if (typeof node === "object") {
		while (node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}
	}
};

/*
	Function: createURL

	Detects local or remote host and constructs desired url.

	Parameters:

		path - The path or the url after the host, like http://localhost:80 + path

	Returns:

		nothing - *
*/
var createURL;
if(funcs.hasOwnProperty('createURL') && typeof funcs.createURL === 'function') {
	createURL = funcs.createURL;
} else {
	createURL = function(path) {
		var url = window.location.href;
		var splitUrl = url.split("/");

		/* detect local or remote routes */
		if(splitUrl[2].match(/localhost.*/)) {
			url = splitUrl[0] + "//" + splitUrl[2] + encodeURI(path);
		} else {
			url = splitUrl[0] + "//" + splitUrl[2] + encodeURI(path);
		}

		return url;
	};
}

/*
	Function: progressFinalize

	Parameters:

		msg - string, for displaying what is being progressed
		max - int, the value representing a completed progress load

	Returns:

		none - *
*/
var progressFinalize;
if(funcs.hasOwnProperty('progressFinalize') && typeof funcs.progressFinalize === 'function') {
	progressFinalize = funcs.progressFinalize;
} else {
	progressFinalize = function(msg,max) {
		document.getElementById("bengine-progressbar" + g_bengine.main).setAttribute("value",max);
		document.getElementById("bengine-progressbar" + g_bengine.main).style.visibility = "hidden";
		document.getElementById("bengine-progressbar" + g_bengine.main).style.display = "none";

		document.getElementById("bengine-autosave" + g_bengine.main).style.visibility = "visible";
		document.getElementById("bengine-autosave" + g_bengine.main).style.display = "block";

		document.getElementById("bengine-savestatus" + g_bengine.main).innerHTML = msg;
	};
}

/*
	Function: progressInitialize

	Parameters:

		msg - string, for displaying what is being progressed
		max - int, the value representing a completed progress load

	Returns:

		none - *
*/
var progressInitialize;
if(funcs.hasOwnProperty('progressInitialize') && typeof funcs.progressInitialize === 'function') {
	progressInitialize = funcs.progressInitialize;
} else {
	progressInitialize = function(msg,max) {
		document.getElementById("bengine-autosave" + g_bengine.main).style.visibility = "hidden";
		document.getElementById("bengine-autosave" + g_bengine.main).style.display = "none";

		document.getElementById("bengine-progressbar" + g_bengine.main).setAttribute("value",0);
		document.getElementById("bengine-progressbar" + g_bengine.main).setAttribute("max",max);
		document.getElementById("bengine-progressbar" + g_bengine.main).style.visibility = "visible";
		document.getElementById("bengine-progressbar" + g_bengine.main).style.display = "block";

		document.getElementById("bengine-savestatus" + g_bengine.main).innerHTML = msg;
	};
}

/*
	Function: progressUpdate

	Parameters:

		value - int, represent current progress

	Returns:

		none - *
*/
var progressUpdate;
if(funcs.hasOwnProperty('progressUpdate') && typeof funcs.progressUpdate === 'function') {
	progressUpdate = funcs.progressUpdate;
} else {
	progressUpdate = function(value) {
		document.getElementById("bengine-progressbar" + g_bengine.main).setAttribute("value",value);
	};
}

// <<<fold>>>

/***
	Section: StartUp Functions
	These are functions that need to be called on a page to start the block engine.
***/

// <<<code>>>

/*
	Function: blockContentShow

	This function create the show blocks div & returns it.

	Parameters:

	main - string, id of an html div that is already attached to the DOM.
	id - array, [name of id,id number], like [bp,1] where 1 is pid
	data - array, array of the block data [type,content,type,content,etc.]

	Returns:

		success - number, block count
*/
this.blockContentShow = function(main,id,data) {
	/* set object global, used to separate one engine from another */
	g_bengine.main = "-" + main + "-";

	/* main div */
	var mainDiv = document.getElementById(main);

	if(mainDiv === 'undefined') {
		return -1;
	}

	/* engine div */
	var enginediv;
	enginediv = document.createElement('div');
	enginediv.setAttribute('class','bengine-instance');
	enginediv.setAttribute('id','bengine-instance' + g_bengine.main);
	mainDiv.appendChild(enginediv);

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','bengine-x-blocks');
	blocksdiv.setAttribute('id','bengine-x-blocks' + g_bengine.main);

	/* append blocks div to engine div */
	enginediv.appendChild(blocksdiv);

	/* append block styles */
	blockStyle();

	var count = 0;
	var i = 1;
	var doubleBlockCount = data.length;

	while(count < doubleBlockCount) {
		/* create the block */
		var block = generateBlock(i,data[count]);
		var retblock = extensibles[data[count]].showContent(block,data[count + 1]);

		if(options.enableSingleView) {
			retblock.children[0].className += " bengine-block-style-embed";
		} else {
			retblock.children[0].className += " bengine-block-style";
		}

		/* create the block div */
		var group = document.createElement('div');
		group.setAttribute('class','bengine-block bengine-block' + g_bengine.main);
		group.setAttribute('id','bengine' + g_bengine.main + i);

		if(options.enableSingleView && i !== 1) {
			group.setAttribute('style','display:none;visibility:hidden;');
		}

		/* append group to blocks div */
		group.appendChild(retblock);
		blocksdiv.appendChild(group);

		count += 2;
		i++;
	}

	function changeBlock(dir) {
		/* back:false, forward:true */
		var direction = -1;
		if(dir) {
			direction = 1;
		}

		var viewDiv = document.getElementById('bengine-currentBlock' + g_bengine.main);
		var viewStatus = Number(viewDiv.getAttribute('data-currentBlock'));

		var next = viewStatus + direction;

		var nextBlock = document.getElementById('bengine' + g_bengine.main + next);
		if(nextBlock !== null) {
			var currentBlock = document.getElementById('bengine' + g_bengine.main + viewStatus);
			currentBlock.setAttribute('style','display:none;visibility:hidden;');

			nextBlock.setAttribute('style','display:block;visibility:visible;');

			viewDiv.setAttribute('data-currentBlock',next);
		}
	}

	if(options.enableSingleView) {
		var singleViewBtnsDiv = document.createElement('div');
		singleViewBtnsDiv.setAttribute('id','bengine-single-view' + g_bengine.main);
		singleViewBtnsDiv.setAttribute('class','bengine-single-view');

		var btnBack = document.createElement('button');
		btnBack.setAttribute('class','bengine-btn-embed bengine-btn-color');
		btnBack.setAttribute('style','width: 50%;');
		btnBack.innerHTML = '&larr;';
		btnBack.onclick = function() {
			changeBlock(false);
		};

		var btnForward = document.createElement('button');
		btnForward.setAttribute('class','bengine-btn-embed bengine-btn-color');
		btnForward.setAttribute('style','width: 50%;');
		btnForward.innerHTML = '&rarr;';
		btnForward.onclick = function() {
			changeBlock(true);
		};

		var currentSingle = document.createElement('div');
		currentSingle.setAttribute('id','bengine-currentBlock' + g_bengine.main);
		currentSingle.setAttribute('data-currentBlock',1);
		currentSingle.setAttribute('style','display:none;visibility:hidden;');

		singleViewBtnsDiv.appendChild(btnBack);
		singleViewBtnsDiv.appendChild(btnForward);
		singleViewBtnsDiv.appendChild(currentSingle);
		enginediv.appendChild(singleViewBtnsDiv);
	}

	return i;
};

/*
	Function: blockEngineStart

	This function create the blocks div & returns it.

	Parameters:

		main - string, id of an html div that is already attached to the DOM.
		id - array, [page type,xid,directory id], like ['page',1,'t'] where 1 is xid
		data - array, array of the block data [type,content,type,content,etc.]

	Returns:

		success - number, block count
*/
var blockEngineStart = function(main,id,data) {
	/* set object global, used to separate one engine from another */
	g_bengine.main = "-" + main + "-";

	/* main div */
	var mainDiv = document.getElementById(main);

	if(mainDiv === 'undefined') {
		return -1;
	}

	/* engine div */
	var enginediv;
	enginediv = document.createElement('div');
	enginediv.setAttribute('class','bengine-instance');
	enginediv.setAttribute('id','bengine-instance' + g_bengine.main);
	mainDiv.appendChild(enginediv);

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','bengine-x-blocks');
	blocksdiv.setAttribute('id','bengine-x-blocks' + g_bengine.main);

	/* append blocks div to engine div */
	enginediv.appendChild(blocksdiv);

	/* append block styles */
	blockStyle();

	/* initial first block buttons, get count for style requirement below */
	var buttons = blockButtons(0);
	var buttonCount = buttons.childNodes.length;
	blocksdiv.appendChild(buttons);

	var count = 0;
	var i = 1;
	var doubleBlockCount = data.length;

	/* hide the first delete button if no blocks, else show it */
	if(doubleBlockCount < 2) {
		buttons.childNodes[buttonCount - 1].children[0].style.visibility = 'hidden';
	} else {
		buttons.childNodes[buttonCount - 1].children[0].style.visibility = 'visible';
	}

	while(count < doubleBlockCount) {
		/* create the block */
		var block = generateBlock(i,data[count]);
		var retblock = extensibles[data[count]].insertContent(block,data[count + 1]);

		/* create the block buttons */
		buttons = blockButtons(i);

		/* hide the last delete button */
		if(count === doubleBlockCount - 2) {
			/* last button is delete, so hide last delete button */
			buttons.childNodes[buttonCount - 1].children[0].style.visibility = 'hidden';
		} else {
			buttons.childNodes[buttonCount - 1].children[0].style.visibility = 'visible';
		}

		/* create block + button div */
		var group = document.createElement('div');
		group.setAttribute('class','bengine-block bengine-block' + g_bengine.main);
		group.setAttribute('id','bengine' + g_bengine.main + i);

		group.appendChild(retblock);
		group.appendChild(buttons);

		/* append group to blocks div */
		blocksdiv.appendChild(group);

		/* do any rendering the block needs */
		extensibles[data[count]].afterDOMinsert('bengine-a' + g_bengine.main + i,null);

		count += 2;
		i++;
	}

	/*** HIDDEN FILE FORM ***/

	/* hidden form for media uploads */
	var fileinput = document.createElement('input');
	fileinput.setAttribute('type','file');
	fileinput.setAttribute('id','bengine-file-select' + g_bengine.main);

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

	/* append the hidden file form to the blocksdiv */
	enginediv.appendChild(fileform);

	/*** HIDDEN PAGE TYPE, XID, & DID (directory id) ***/

	/* add page id & name to hidden div */
	var idDiv = document.createElement("input");
	idDiv.setAttribute("id","bengine-x-id" + g_bengine.main);
	idDiv.setAttribute("name",id[0]);
	idDiv.setAttribute("data-xid",id[1]);
	idDiv.setAttribute("data-did",id[2]);
	idDiv.style.visibility = 'hidden';
	idDiv.style.display = 'none';
	enginediv.appendChild(idDiv);

	/*** HIDDEN STATUS ID DIV ***/

	/* this is set to 0 after block adds and deletes & 1 after saves */
	/* it is checked when exiting a window to notify the user that the page hasn't been saved */
	var statusid = document.createElement('input');
	statusid.setAttribute('type','hidden');
	statusid.setAttribute('id','bengine-statusid' + g_bengine.main);
	statusid.setAttribute('value','1');
	enginediv.appendChild(statusid);

	/*** HIDDEN MAIN ID DIV ***/
	var mainid = document.createElement('input');
	mainid.setAttribute('type','hidden');
	mainid.setAttribute('id','x-mainid');
	mainid.setAttribute('value',main);
	enginediv.appendChild(mainid);

	return i;
};

this.blockEngineStart = function(main,id,data) {
	blockEngineStart(main,id,data);
};

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
var countBlocks = function() {

	/* block IDs are just numbers, so count the number of IDs */
	var num = 0;
	var miss = true;
	while (miss === true) {
		num++;

		/* undefined is double banged to false, and node is double banged to true */
		miss = Boolean(document.getElementById('bengine' + g_bengine.main + num));
	}

	/* decrement num, since the check for id happens after increment */
	return --num;
};

/*
	Function: generateBlock

	Creates a content block with the given block type and block id provided.

	Parameters:

		bid - the block id
		btype - the block type

	Returns:

		success - html node, block
*/
var generateBlock = function(bid,btype) {
	var block = document.createElement('div');
	if(!options.enableSingleView && btype !== 'title') {
		block.setAttribute('style','margin-bottom:26px;');
	}
	block.setAttribute('data-btype',btype);
	block.setAttribute('id','bengine-a' + g_bengine.main + bid);

	return block;
};

/*
	Function: blockStyle

	Appends custom block css styles to dom.

	Parameters:

		none

	Returns:

		none
*/
var blockStyle = function() {
	for(var prop in extensibles)(function(prop) {
		if(extensibles.hasOwnProperty(prop)) {
			/* attach the blocks styline */
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = extensibles[prop].styleBlock();
			document.getElementsByTagName('head')[0].appendChild(style);
		}
	})(prop);
};

/*
	Function: blockButtons

	This creates a div that holds all of the buttons for creating and deleting blocks. This function returns that div.

	Parameters:

		bid - the block id, which is used to determine where a block should inserted or removed

	Returns:

		success - html node, button div
*/
var blockButtons = function(bid) {

	/* this div will hold the buttons inside of it */
	var buttonDiv = document.createElement('div');
	buttonDiv.setAttribute('class','bengine-blockbtns row');
	buttonDiv.setAttribute('id','bengine-b' + g_bengine.main + bid);

	/// there should prob be better styling than this
	/// if greater than 10, buttons won't fit...
	var percentageWidth = 100 / (Object.keys(extensibles).length + 1);

	/* the following are all of the buttons */
	for(var prop in extensibles)(function(prop) {
		if(extensibles.hasOwnProperty(prop)) {
			var colDiv = document.createElement('div');
			colDiv.setAttribute('class','col col-' + percentageWidth);

			var btn = document.createElement('button');
			btn.onclick = function() {
				addBlock(bid,extensibles[prop].type);
			};
			btn.setAttribute("class","bengine-blockbtn addbtn");
			btn.innerHTML = extensibles[prop].name;

			colDiv.appendChild(btn);
			buttonDiv.appendChild(colDiv);
		}
	})(prop);

	/* add the delete button */
	var delDiv = document.createElement('div');
	delDiv.setAttribute('class','col col-' + percentageWidth);

	var delBtn = document.createElement('button');
	delBtn.setAttribute('id','bengine-d' + g_bengine.main + bid);
	delBtn.setAttribute("class","bengine-blockbtn delbtn");
	delBtn.onclick = function() {
		deleteBlock(bid);
	};
	delBtn.style.visibility = 'hidden';
	delBtn.innerHTML = "&darr;";

	delDiv.appendChild(delBtn);
	buttonDiv.appendChild(delDiv);

	return buttonDiv;
};

/*
	Function: makeSpace

	This function creates space for a block that is going to be inserted. In other words, if there are three block 1,2,3, and a block wants to be inserted into the 2nd position, this function will change the current block IDs to 1,3,4.

	Parameters:

		bid - the block id to make room for
		count - the number of block on the page

	Returns:

		none
*/
var makeSpace = function(bid,count) {
	var track = count;
	while(bid < track) {
		/* change blocks to this value */
		var next = track + 1;

		/* replace the button IDs */
		var buttons = blockButtons(next);
		document.getElementById('bengine-b' + g_bengine.main + track).parentNode.replaceChild(buttons,document.getElementById('bengine-b' + g_bengine.main + track));

		/* replace the content block id */
		document.getElementById('bengine-a' + g_bengine.main + track).setAttribute('id','bengine-a' + g_bengine.main + next);

		/* replace the block id */
		document.getElementById('bengine' + g_bengine.main + track).setAttribute('id','bengine' + g_bengine.main + next);

		/* update the count */
		track--;
	}
};

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
var insertBlock = function(block,buttons,bid,count) {

	/* grab the blocks container */
	var blocksdiv = document.getElementById('bengine-x-blocks' + g_bengine.main);

	/* create the block div */
	var group = document.createElement('div');
	group.setAttribute('class','bengine-block bengine-block' + g_bengine.main);
	group.setAttribute('id','bengine' + g_bengine.main + bid);

	/* append the content block & buttons div to the block div */
	group.appendChild(block);
	group.appendChild(buttons);

	/* find the location to insert the block and insert it */
	if(bid <= count) {
		var position = blocksdiv.children[bid];
		blocksdiv.insertBefore(group,position);
	} else {
		/* you do this if the block goes at the end, it's the last block */
		blocksdiv.appendChild(group);
	}
};

/*
	Function: createBlock

	This function calls all of the necessary functions to put a block on the page.

	Parameters:

		bid - the block id
		btype - the block type

	Returns:

		none
*/
var createBlock = function(cbid,blockObj) {

	var blockCount = countBlocks();

	/* make space if inserting block, if appending block, ignore */
	if(cbid < blockCount) {
		makeSpace(cbid,blockCount);
	}

	/* create and insert block */
	var bid = cbid + 1;

	var content = "";

	var block = generateBlock(bid,blockObj.type);
	var retblock = blockObj.insertContent(block,content);
	var blockbuttons = blockButtons(bid);
	insertBlock(retblock,blockbuttons,bid,blockCount);
	blockObj.afterDOMinsert('bengine-a' + g_bengine.main + bid,null);

	/* make delete buttons visible */
	var i = 0;
	while(i <= blockCount) {
		document.getElementById('bengine-d' + g_bengine.main + i).style.visibility = 'visible';
		i++;
	}
};

/*
	Function: addBlock

	This function is the starting point for adding a block. It calls the right function for creating a block according to the block type.

	Parameters:

		bid - the block id
		btype - the block type

	Returns:

		none
*/
var addBlock = function(bid,blockTypeName) {
	if(options.blockLimit < (document.getElementsByClassName("bengine-block" + g_bengine.main).length + 1)) {
		alertify.alert("You Have Reached The Block Limit");
		return;
	}

	var blockObj = extensibles[blockTypeName];

	/* media blocks only allowed in-house, all other block (text-based) route to regular process */
	if (blockObj.upload) {
		/* these blocks call uploadMedia() which uploads media and then calls createBlock() */
		uploadMedia(bid + 1,blockObj);
	} else {
		/* these blocks call createBlock() to add the block */
		createBlock(bid,blockObj);
		/* save blocks to temp table, indicated by false */
		saveBlocks(false);
	}
};

/*
	Function: closeSpace

	This function closes the space left by a removed block. In other words, if there are three block 1,2,3, and a the 2nd block is removed, this function will change the current block IDs from 1,3 to 1,2.

	Parameters:

		bid - the block id to close on
		count - the number of block on the page

	Returns:

		none
*/
var closeSpace = function(cbid,count) {
	var bid = cbid;
	while(bid < count) {
		/* change blocks to this value */
		var next = bid + 1;

		/* replace the button IDs */
		var buttons = blockButtons(bid);
		document.getElementById('bengine-b' + g_bengine.main + next).parentNode.replaceChild(buttons,document.getElementById('bengine-b' + g_bengine.main + next));

		/* replace the content block id */
		document.getElementById('bengine-a' + g_bengine.main + next).setAttribute('id','bengine-a' + g_bengine.main + bid);

		/* replace the block id */
		document.getElementById('bengine' + g_bengine.main + next).setAttribute('id','bengine' + g_bengine.main + bid);

		/* update the bid */
		bid++;
	}
};

/*
	Function: removeBlock

	This function removes a block.

	Parameters:

		bid - the block id of the block to remove

	Returns:

		nothing - *
*/
var removeBlock = function(bid) {
	var element = document.getElementById('bengine' + g_bengine.main + bid);
	element.parentNode.removeChild(element);
};

/*
	Function: deleteBlock

	This function is the starting point for removing a block. It calls the needed functions to handle block removal.

	Parameters:

		bid - the block id of the block to remove

	Returns:

		nothing - *
*/
var deleteBlock = function(cbid) {
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
		document.getElementById('bengine-d' + g_bengine.main + i).style.visibility = 'visible';
		i++;
	}
	document.getElementById('bengine-d' + g_bengine.main + i).style.visibility = 'hidden';

	/* save blocks to temp table, indicated by false */
	saveBlocks(false);
};

// <<<fold>>>

/***
	Section: Ajax Functions
	These are functions to retrieve data from the back-end.
***/

// <<<code>>>

/*
	Function: revertBlocks

	This function loads the page with last permanent save data.

	Parameters:

		pageDisplayFunc - function, the page function that loads the page.

	Returns:

		nothing - *
*/
this.revertBlocks = function() {
	/* create the url destination for the ajax request */
	var url = createURL("/revertblocks");

	/* get the pid & page name */
	var xid = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('data-xid');
	var xidName = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('name');

	/* get the did for restarting the bengine instance */
	var did = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('data-did');

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "xid=" + xid + "&pagetype=" + xidName;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'success':
						var oldBengine = document.getElementById('bengine-instance' + g_bengine.main);
						var main = oldBengine.parentNode;
						main.removeChild(oldBengine);
						if(result.data === "") {
							blockEngineStart(main.getAttribute('id'),[xidName,xid,did],[]);
						} else {
							blockEngineStart(main.getAttribute('id'),[xidName,xid,did],result.data.split(","));
						}
						document.getElementById("bengine-savestatus" + g_bengine.main).innerHTML = "Saved";
						break;
					case 'noxid':
						alertify.alert("This Page Is Not Meant To Be Visited Directly."); break;
					case 'norevertloggedout':
						alertify.alert("Revert Error. You Are Not Logged In."); break;
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

/*
	Function: saveBlocks

	This function grabs block data and sends it to the back-end for saving.

	Parameters:

		which - should be a boolean. false saves blocks to database temporary table, true saves blocks to database permanent table.

	Returns:

		nothing - *
*/
if(options.enableSave === false) {
	saveBlocks = function(which) { /* do nothing */ };
} else {
var saveBlocks = function(which) {

	/* set parameter to be sent to back-end that determines which table to save to, temp or perm, & set save status display */
	var table;
	if(which === false) {
		table = 0;
		document.getElementById("bengine-savestatus" + g_bengine.main).innerHTML = "Not Saved";
	} else {
		table = 1;
	}

	document.getElementById('bengine-statusid' + g_bengine.main).setAttribute('value',table);

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
			var btype = document.getElementById('bengine-a' + g_bengine.main + bid).getAttribute('data-btype');
			blockType[i] = btype;

			/* get the block content */
			blockContent[i] = extensibles[btype].saveContent('bengine-a' + g_bengine.main + bid);

			i++;
			bid++;
		}

		/* merge mediaType & mediaContent arrays into default comma-separated strings */
		var types = blockType.join("@^@");
		var contents = blockContent.join("@^@");
	}

	/* create the url destination for the ajax request */
	var url = createURL("/saveblocks");

	/* get the pid & page name */
	var xid = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('data-xid');
	var xidName = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('name');

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

	var params = "mediaType=" + types + "&mediaContent=" + contents + "&xid=" + xid + "&pagetype=" + xidName + "&tabid=" + table;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'blocksaved':
						if(table === 1) {
							document.getElementById("bengine-savestatus" + g_bengine.main).innerHTML = "Saved";
						}
						break;
					case 'nosaveloggedout':
						alertify.alert("You Can't Save This Page Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again.");
						break;
					case 'err':
					default:
						alertify.alert("An Unknown Save Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
};
}

this.saveBlocks = function(which) {
	saveBlocks(which);
};

/*
	Function: uploadMedia

	This function make an ajax request to upload user media. After the response, the media is loaded and rendered.

	Parameters:

		bid - the bid of the media block
		btype - the type of media, "image" "audio" "video" "slide"

	Returns:

		none
*/
var uploadMedia = function(bid,blockObj) {

	/* get the hidden file-select object that will store the user's file selection */
	var fileSelect = document.getElementById('bengine-file-select' + g_bengine.main);

	/* change file-select to only accept files based on btype */
	switch(blockObj.type) {
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

		/* validation */
		var notvalid = false;
		var nofile = false;
		var errorMsg;
		if(fileSelect.files.length > 0) {
			if(file.size > (options.mediaLimit * 1048576)) {
				notvalid = true;
				errorMsg = `Files Must Be Less Than ${options.mediaLimit} MB`;
			}
		} else {
			nofile = true;
		}

		var checklengthvideo = false;
		var checklengthaudio = false;
		switch(blockObj.type) {
			case "audio":
				var audTempElement = document.createElement('audio');
				var audFileURL = URL.createObjectURL(file);
				audTempElement.src = audFileURL;
				checklengthaudio = true;
				break;
			case "video":
				var vidTempElement = document.createElement('video');
				var vidFileURL = URL.createObjectURL(file);
				vidTempElement.src = vidFileURL;
				checklengthvideo = true;
				break;
			default:
		}

		if(nofile) {
			/* do nothing, no file selected */
			this.value = null;
			return;
		}

		if(notvalid) {
			alertify.alert(errorMsg);
		} else {
			/* this gets called below where length check occurs */
			function uploadProcess() {
				/* create the block to host the media */
				createBlock(bid - 1,blockObj);

				/* wrap the ajax request in a promise */
				var promise = new Promise(function(resolve,reject) {

					/* create javascript FormData object and append the file */
					var formData = new FormData();
					formData.append('media',file,file.name);

					/* get the directory id */
					var did = document.getElementById('bengine-x-id' + g_bengine.main).getAttribute('data-did');

					/* grab the domain and create the url destination for the ajax request */
					var url = createURL("/uploadmedia?did=" + did + "&btype=" + blockObj.type);

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
								} else if(xmlhttp.responseText === "nopatherr") {
									reject("nopatherr");
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

				promise.then(function(data) {
					blockObj.afterDOMinsert('bengine-a' + g_bengine.main + bid,data);

					/* save blocks to temp table, indicated by false */
					saveBlocks(false);
				},function(error) {
					if(error === "convertmediaerr") {
						alertify.log("There was an error with that media format. Please try a different file type.");
					} else if (error === "nopatherr") {
						alertify.log("Bad path error.");
					} else {
						alertify.log("There was an unknown error during media upload.");
					}
				});
			}

			if(checklengthvideo) {
				vidTempElement.ondurationchange = function() {
					if(this.duration > options.playableMediaLimit) {
						alertify.alert(`Videos Must Be Less Than ${options.playableMediaLimit} Seconds`);
					} else {
						uploadProcess();
					}
				};
			} else if(checklengthaudio) {
				audTempElement.ondurationchange = function() {
					if(this.duration > options.playableMediaLimit) {
						alertify.alert(`Videos Must Be Less Than ${options.playableMediaLimit} Seconds`);
					} else {
						uploadProcess();
					}
				};
			} else {
				uploadProcess();
			}
		}
		/* resets selection to nothing, in case user decides to upload the same file, onchange will still fire */
		this.value = null;
	};
};

// <<<fold>>>

} // end of Bengine
