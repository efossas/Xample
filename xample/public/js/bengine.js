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
*/
/* list any objects js dependencies */
/*
	global MathJax:true
	global PDFJS:true
	global hljs:true
	global alertify:true
*/

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
	for(var prop in x) {
		if(x.hasOwnProperty(prop)) {
			var btn = document.createElement('button');
			btn.setAttribute("onclick","addBlock(" + bid + ",x." + x[prop].type + ")");
			btn.setAttribute("class","blockbtn addbtn");
			btn.innerHTML = x[prop].name;

			buttonDiv.appendChild(btn);
		}
	}

	/* add the delete button */
	var delBtn = document.createElement('button');
	delBtn.setAttribute('id','d' + bid);
	delBtn.setAttribute('onclick','deleteBlock(' + bid + ')');
	delBtn.setAttribute("class","blockbtn delbtn");
	delBtn.style.visibility = 'hidden';
	delBtn.innerHTML = "&darr;";

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

// <<<fold>>>

/***
	Section: Ajax Functions
	These are functions to retrieve data from the back-end.
***/

// <<<code>>>

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

				/* get the page id */
				var pid = document.getElementsByName('pageid')[0].value;

				/* grab the domain and create the url destination for the ajax request */
				var url = createURL("/uploadmedia?pid=" + pid + "&btype=" + blockObj.type);

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
					console.log("uploadMedia() promise error");
				}
			});
		}
		/* this resets the selection to nothing, in case the user decides to upload the same file, onchange will still fire */
		this.value = null;
	};
}

// <<<fold>>>
