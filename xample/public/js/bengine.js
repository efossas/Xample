/* eslint-env browser, es6 */
/******
	Title: Block Engine
	This is the front-end for the Block Engine.
******/

/***
	Section: Globals
	These are the global variables xample uses

	x - used to store extensible blocks. hence, x.newBlock should be an object that contains all of the necessary methods for block execution.
	globalBlockEngine - used to store any globals that blocks need. block objects should call a self executing anonymous function that appends a property to this global, such as globalBlockEngine.newProperty = {};

***/

var x = {};
var globalBlockEngine = {};

/* from omni.js */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
	global btnLink:true
	global btnSubmit:true
	global barMenu:true
	global barStatus:true
	global progressInitialize:true
	global progressFinalize:true
	global progressUpdate:true
	global getUserFields:true
	global getSubjects:true
	global journalError:true
*/
/* list any objects js dependencies */
/*
	global MathJax:true
	global PDFJS:true
	global hljs:true
	global alertify:true
*/

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
	x - object, containing all of the block objects, like x.myblock
	id - array, [name of id,id number], like [bp,1] where 1 is pid
	data - array, array of the block data [type,content,type,content,etc.]

	Returns:

		success - number, block count
*/
function blockContentShow(main,x,id,data) {
	/* main div */
	var mainDiv = document.getElementById(main);

	if(mainDiv === 'undefined') {
		return -1;
	}

	/* engine div */
	var enginediv;
	enginediv = document.createElement('div');
	enginediv.setAttribute('class','x-bengine');
	enginediv.setAttribute('id','x-bengine');
	mainDiv.appendChild(enginediv);

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','x-blocks');
	blocksdiv.setAttribute('id','x-blocks');

	/* append blocks div to engine div */
	enginediv.appendChild(blocksdiv);

	var count = 0;
	var i = 1;
	var doubleBlockCount = data.length;

	while(count < doubleBlockCount) {
		/* create the block */
		var block = generateBlock(i,data[count]);
		var retblock = x[data[count]].showContent(block,data[count + 1]);

		/* create the block div */
		var group = document.createElement('div');
		group.setAttribute('class','block');
		group.setAttribute('id',i);

		/* append group to blocks div */
		group.appendChild(retblock);
		blocksdiv.appendChild(group);

		count += 2;
		i++;
	}

	return i;
}

/*
	Function: blockEngineStart

	This function create the blocks div & returns it.

	Parameters:

		main - string, id of an html div that is already attached to the DOM.
		x - object, containing all of the objects for generating blocks, like x.myblock
		id - array, [page type,xid,directory id], like ['page',1,'t'] where 1 is xid
		data - array, array of the block data [type,content,type,content,etc.]

	Returns:

		success - number, block count
*/
function blockEngineStart(main,x,id,data) {
	/* main div */
	var mainDiv = document.getElementById(main);

	if(mainDiv === 'undefined') {
		return -1;
	}

	/* engine div */
	var enginediv;
	enginediv = document.createElement('div');
	enginediv.setAttribute('class','x-bengine');
	enginediv.setAttribute('id','x-bengine');
	mainDiv.appendChild(enginediv);

	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class','x-blocks');
	blocksdiv.setAttribute('id','x-blocks');

	/* append blocks div to engine div */
	enginediv.appendChild(blocksdiv);

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
		var retblock = x[data[count]].insertContent(block,data[count + 1]);

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
		group.setAttribute('class','block');
		group.setAttribute('id',i);

		group.appendChild(retblock);
		group.appendChild(buttons);

		/* append group to blocks div */
		blocksdiv.appendChild(group);

		/* do any rendering the block needs */
		x[data[count]].afterDOMinsert(i,null);

		count += 2;
		i++;
	}

	/*** HIDDEN FILE FORM ***/

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

	/* append the hidden file form to the blocksdiv */
	enginediv.appendChild(fileform);

	/*** HIDDEN PAGE TYPE, XID, & DID (directory id) ***/

	/* add page id & name to hidden div */
	var idDiv = document.createElement("input");
	idDiv.setAttribute("id","x-id");
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
	statusid.setAttribute('id','statusid');
	statusid.setAttribute('value','1');
	enginediv.appendChild(statusid);

	/*** HIDDEN MAIN ID DIV ***/
	var mainid = document.createElement('input');
	mainid.setAttribute('type','hidden');
	mainid.setAttribute('id','x-mainid');
	mainid.setAttribute('value',main);
	enginediv.appendChild(mainid);

	return i;
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
	} else if (blockType === "xmath" || blockType === "latex") {
		deparsed = deparsed.replace(/\\\\/g,'\\');
	} else {
		//deparsed = "";
	}

	return deparsed;
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
	buttonDiv.setAttribute('class','blockbtns row');
	buttonDiv.setAttribute('id','b' + bid);

	/// there should prob be better styling than this
	/// if greater than 10, buttons won't fit...
	var percentageWidth = 100 / (Object.keys(x).length + 1);

	/* the following are all of the buttons */
	for(var prop in x) {
		if(x.hasOwnProperty(prop)) {
			var colDiv = document.createElement('div');
			colDiv.setAttribute('class','col col-' + percentageWidth);

			var btn = document.createElement('button');
			btn.setAttribute("onclick","addBlock(" + bid + ",x." + x[prop].type + ")");
			btn.setAttribute("class","blockbtn addbtn");
			btn.innerHTML = x[prop].name;

			colDiv.appendChild(btn);
			buttonDiv.appendChild(colDiv);
		}
	}

	/* add the delete button */
	var delDiv = document.createElement('div');
	delDiv.setAttribute('class','col col-' + percentageWidth);

	var delBtn = document.createElement('button');
	delBtn.setAttribute('id','d' + bid);
	delBtn.setAttribute('onclick','deleteBlock(' + bid + ')');
	delBtn.setAttribute("class","blockbtn delbtn");
	delBtn.style.visibility = 'hidden';
	delBtn.innerHTML = "&darr;";

	delDiv.appendChild(delBtn);
	buttonDiv.appendChild(delDiv);

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
	var blocksdiv = document.getElementById('x-blocks');

	/* create the block div */
	var group = document.createElement('div');
	group.setAttribute('class','block');
	group.setAttribute('id',bid);

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
function createBlock(cbid,blockObj) {

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
	blockObj.afterDOMinsert(bid,null);

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
function addBlock(bid,blockObj) {

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

/*
	Function: parseBlock

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
	} else if (blockType === "xmath" || blockType === "latex") {
		parsed = parsed.replace(/\\/g,"\\\\");
	} else {
		//parsed = "";
	}
	return parsed;
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
function barPageSettings(pagetype,aid,settings) {
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

	/* row for image and blurb */
	var rowImgBlurb = document.createElement('div');
	rowImgBlurb.setAttribute('class','row');

	function uploadThumb() {
		/* get the hidden file-select object that will store the user's file selection */
		var fileSelect = document.getElementById('file-select');
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
					var id = document.getElementById('x-id').getAttribute('data-did');

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
	colImg.setAttribute('class','col col-33');

	var thumbnail = document.createElement('img');
	thumbnail.setAttribute('id','pageimg');
	thumbnail.setAttribute('class','thumb-img');
	thumbnail.onclick = uploadThumb;
	thumbnail.setAttribute('src',settings.imageurl);
	colImg.appendChild(thumbnail);

	/* page blurb input */
	var colBlurb = document.createElement('div');
	colBlurb.setAttribute('class','col col-66');

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
	var btnSaveSettings = btnSubmit('Save ' + capital + ' Settings','savePageSettings("' + pagetype + '")','none');
	pageSettings.appendChild(btnSaveSettings);

	return pageSettings;
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
			var categories = Object.keys(globalBlockEngine.subjects[subject]);
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
			var topics = globalBlockEngine.subjects[subject][category];
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
	};
	listTopics.style = "color: grey";

	/* get subjects for select topic list */
	var subjectsPromise = getSubjects();

	subjectsPromise.then(function(data) {
		var subjectsData = data;
		globalBlockEngine.subjects = subjectsData;

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
			var categories = Object.keys(globalBlockEngine.subjects[defSub]);
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
			var topics = globalBlockEngine.subjects[defSub][defCat];
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
		if(error === "unknown") {
			journalError("getSubjects() unknown result.msg","nav.js",new Error().lineNumber,"","");
		}
	});

	/* append lists to columns */
	colLeft_SubjectSelect.appendChild(listSubjects);
	colMiddle_SubjectSelect.appendChild(listCategories);
	colRight_SubjectSelect.appendChild(listTopics);

	return row_SubjectSelect;
}

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
function revertBlocks() {
	/* create the url destination for the ajax request */
	var url = createURL("/revertblocks");

	/* get the pid & page name */
	var xid = document.getElementById('x-id').getAttribute('data-xid');
	var xidName = document.getElementById('x-id').getAttribute('name');

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
						var oldBengine = document.getElementById('x-bengine');
						var main = oldBengine.parentNode;
						main.removeChild(oldBengine);
						blockEngineStart(main.getAttribute('id'),x,[xidName,xid],result.data.split(","));
						document.getElementById("savestatus").innerHTML = "Saved";
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
	}

	document.getElementById('statusid').setAttribute('value',table);

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

			/* get the block content */
			blockContent[i] = x[btype].saveContent(bid);

			i++;
			bid++;
		}

		/* merge mediaType & mediaContent arrays into default comma-separated strings */
		var types = blockType.join();
		var contents = blockContent.join();
	}

	/* create the url destination for the ajax request */
	var url = createURL("/saveblocks");

	/* get the pid & page name */
	var xid = document.getElementById('x-id').getAttribute('data-xid');
	var xidName = document.getElementById('x-id').getAttribute('name');

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
							document.getElementById("savestatus").innerHTML = "Saved";
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
}

/*
	Function: savePageSettings

	This function makes an ajax request to save the page settings.

	Parameters:

		pagetype - string, type of page being saved

	Returns:

		none
*/
function savePageSettings(pagetype) {
	/* create the url destination for the ajax request */
	var url = createURL('/savepagesettings');

	/* get the pid & page name */
	var id = document.getElementById('x-id').getAttribute('data-xid');
	var title = document.getElementById('pagetitle').value;
	var subject = document.getElementById('select-subject').value;
	var category = document.getElementById('select-category').value;
	var topic = document.getElementById('select-topic').value;
	var imageurl = document.getElementById('pageimg').src.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	var blurb = document.getElementById('pageblurb').value;

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "pt=" + pagetype + "&id=" + id + "&p=" + title + "&s=" + subject + "&c=" + category + "&t=" + topic + "&i=" + imageurl + "&b=" + blurb;

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
function uploadMedia(bid,blockObj) {

	/* get the hidden file-select object that will store the user's file selection */
	var fileSelect = document.getElementById('file-select');

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
			/* create the block to host the media */
			createBlock(bid - 1,blockObj);

			/* wrap the ajax request in a promise */
			var promise = new Promise(function(resolve,reject) {

				/* create javascript FormData object and append the file */
				var formData = new FormData();
				formData.append('media',file,file.name);

				/* get the directory id */
				var did = document.getElementById('x-id').getAttribute('data-did');

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

				blockObj.afterDOMinsert(bid,data);

				/* save blocks to temp table, indicated by false */
				saveBlocks(false);
			},function(error) {
				if(error === "convertmediaerr") {
					alertify.log("There was an error with that media format. Please try a different file type.");
				} else {
					alertify.log("There was an unknown error during media upload.");
				}
			});
		}
		/* this resets the selection to nothing, in case the user decides to upload the same file, onchange will still fire */
		this.value = null;
	};
}

// <<<fold>>>
