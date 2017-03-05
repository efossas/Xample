/* eslint-env browser, es6 */
/*
	Title: Navigation
	This is the front-end for Xample Block Pages

	Topic: Important Terms

		Block ID - Blocks are just <div> tags with the attribute id=""
		Block Type - Blocks are given the attribute class="". Used to insert the correct html into the block <div>
		Block Content - The actual content of the block (not the html). This could be text, image link, etc.
		Block Count - The number of blocks currently on the page. Used a lot for inserting or changing block id's.
		Page Table - Pages are stored in the database as p_uid_pid, where uid = user id & pid = page id.

	Topic: Important Divs

		content - This class is a div that holds all of the content of the page. Known as the "main div"
		blocks - This class holds all of the page blocks.

*/

/*****
	Title: Navigation
	This is the front-end for Xample general pages.
*****/

/***
	Section: Globals
	These are the global variables xample uses

	globalScope - attach needed global variables as properties to this object
***/

// <<<code>>>

var globalScope = {};

/* list any functions that will be joined to this file here from omni */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
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
	global journalError:true
	global setBookmark:true
	global setView:true
	global watermark:true
*/

/* list any objects from other js files here */
/*
	global alertify:true
*/

// <<<fold>>>

/***
	Section: Helper Functions
	These are helper functions.
***/

/***
	Section: Display Functions
	These are functions to create, remove, or show page elements.
***/

// <<<code>>>

/*
	Function: barSearch

	Creates the search bar.

	Parameters:

		idname - the id that will be attached to the search div.
		keywords - existing words to be placed in as value.

	Returns:

		success - html node, search div
*/
function barSearch(idname,keywords) {
	/* create the search input */
	var searchDiv = document.createElement('div');
	searchDiv.setAttribute('class','search-bar');

	var searchRow = document.createElement('div');
	searchRow.setAttribute('class','row');

	var searchCol = document.createElement('div');
	searchCol.setAttribute('class','col col-100');

	var searchBar = document.createElement('input');
	searchBar.setAttribute('id',idname);
	searchBar.setAttribute('class','text-input');
	searchBar.setAttribute('type','search');
	searchBar.setAttribute('placeholder','Search');

	/* add existing words to search input */
	var words = keywords;
	if(!keywords) {
		words = '';
	}

	searchBar.setAttribute('value',words);

	searchCol.appendChild(searchBar);
	searchRow.appendChild(searchCol);
	searchDiv.appendChild(searchRow);

	/* create div to display search results */
	var resultsRow = document.createElement('div');
	resultsRow.setAttribute('class','row');

	var resultsCol = document.createElement('div');
	resultsCol.setAttribute('class','col col-100');

	var resultsDisplay = document.createElement('div');
	resultsDisplay.setAttribute('id','search-results');

	resultsCol.appendChild(resultsDisplay);
	resultsRow.appendChild(resultsCol);
	searchDiv.appendChild(resultsRow);

	return searchDiv;
}

/*
	Function: boxCreate

	Creates a content box for displaying info about pages.

	Parameters:

		* - none

	Returns:

		success - html node, box
*/
function boxCreate() {
	/* holds the entire link */
	var box = document.createElement('div');
	box.setAttribute('class','content-box');

	/* holds title, author, rating, & bookmark */
	var topRow = document.createElement('div');
	topRow.setAttribute('class','row');

	/* create title */
	var colTitle = document.createElement('div');
	colTitle.setAttribute('class','col col-60');

	var title = document.createElement('div');
	title.setAttribute('class','box-title');
	title.innerHTML = "";
	colTitle.appendChild(title);

	/* create author */
	var colAuthor = document.createElement('div');
	colAuthor.setAttribute('class','col col-15');

	var author = document.createElement('div');
	author.setAttribute('class','box-author');
	colAuthor.appendChild(author);

	/* create rating */
	var colRating = document.createElement('div');
	colRating.setAttribute('class','col col-15');

	var rating = document.createElement('div');
	rating.setAttribute('class','box-rating');
	colRating.appendChild(rating);

	var ratingBar = document.createElement('div');
	ratingBar.setAttribute('class','rating-bar');
	ratingBar.setAttribute('role','progressbar');
	rating.appendChild(ratingBar);

	/* create bookmark */
	var colBookmark = document.createElement('div');
	colBookmark.setAttribute('class','col col-5');

	var bookmark = document.createElement('div');
	bookmark.setAttribute('class','box-bookmark');
	colBookmark.appendChild(bookmark);

	var bmark = document.createElement('input');
	bmark.setAttribute('type','checkbox');
	bmark.setAttribute('class','bmark');
	bookmark.appendChild(bmark);

	/* create expand */
	var colExpand = document.createElement('div');
	colExpand.setAttribute('class','col col-5');

	var expand = document.createElement('div');
	expand.setAttribute('class','box-expand');
	colExpand.appendChild(expand);

	/* add expand btn */
	var btnExpand = btnSubmit('+','expandRow(this)','none');
	expand.appendChild(btnExpand);

	/* append to top row */
	topRow.appendChild(colTitle);
	topRow.appendChild(colAuthor);
	topRow.appendChild(colRating);
	topRow.appendChild(colBookmark);
	topRow.appendChild(colExpand);

	/* holds image and a row */
	var bottomRow = document.createElement('div');
	bottomRow.setAttribute('class','row');
	bottomRow.setAttribute('style','display:none;visibility:hidden;');

	/* create image */
	var colImage = document.createElement('div');
	colImage.setAttribute('class','col col-35');

	var image = document.createElement('div');
	image.setAttribute('class','box-image');
	colImage.appendChild(image);

	/* upper row for right section, holds blurb */
	var upperRow = document.createElement('div');
	upperRow.setAttribute('class','row');

	/* create blurb */
	var colBlurb = document.createElement('div');
	colBlurb.setAttribute('class','col col-100');

	var blurb = document.createElement('div');
	blurb.setAttribute('class','box-blurb');
	colBlurb.appendChild(blurb);

	/* append to upper row */
	upperRow.appendChild(colBlurb);

	/* lower row for right section, holds created, edited, ranks, views */
	var lowerRow = document.createElement('div');
	lowerRow.setAttribute('class','row');

	/* create date created */
	var colCreated = document.createElement('div');
	colCreated.setAttribute('class','col col-25');

	var created = document.createElement('div');
	created.setAttribute('class','box-created');
	colCreated.appendChild(created);

	/* create edited */
	var colEdited = document.createElement('div');
	colEdited.setAttribute('class','col col-25');

	var edited = document.createElement('div');
	edited.setAttribute('class','box-edited');
	colEdited.appendChild(edited);

	/* create ranks */
	var colRanks = document.createElement('div');
	colRanks.setAttribute('class','col col-25');

	var ranks = document.createElement('div');
	ranks.setAttribute('class','box-ranks');
	colRanks.appendChild(ranks);

	/* views */
	var colViews = document.createElement('div');
	colViews.setAttribute('class','col col-25');

	var views = document.createElement('div');
	views.setAttribute('class','box-views');
	colViews.appendChild(views);

	/* append to bottom row */
	lowerRow.appendChild(colCreated);
	lowerRow.appendChild(colEdited);
	lowerRow.appendChild(colRanks);
	lowerRow.appendChild(colViews);

	/* column for upper and lower rows */
	var colRightSection = document.createElement('div');
	colRightSection.setAttribute('class','col col-65');

	/* append upper and lower rows to right section */
	colRightSection.appendChild(upperRow);
	colRightSection.appendChild(lowerRow);

	/* append left and right sections to bottom row */
	bottomRow.appendChild(colImage);
	bottomRow.appendChild(colRightSection);

	/* append rows to div & set visibility */
	box.appendChild(topRow);
	box.appendChild(bottomRow);

	return box;
}

/*
	Function: formDisplayPlaylist

	Create dash for viewing list of content.

	Parameters:

		listheader - string, the name of the type of content page to create.
		bmdata - array, of objects containing content info.

	Returns:

		success - html node, bookmarks dash
*/
function formDisplayPlaylist(listheader,bmdata) {
	/* create header */
	var rowHeader = document.createElement('div');
	rowHeader.setAttribute('class','row');

	var colHeader = document.createElement('div');
	colHeader.setAttribute('class','col col-100');

	var dashHeader = document.createElement('h2');
	dashHeader.innerHTML = listheader;

	colHeader.appendChild(dashHeader);
	rowHeader.appendChild(colHeader);

	/* append the page links to a form div */
	var dash = document.createElement('div');
	dash.setAttribute('class','dash-box');
	dash.appendChild(rowHeader);

	/* create data box */
	var dataselect = document.createElement('div');
	dataselect.setAttribute('class','data-box');

	function listSelect(evt) {
		var aid = this.getAttribute('data-aid');
		var xid = this.getAttribute('data-xid');

		window.location = 'page?a=' + aid + '&p=' + xid;
	}

	function listHover(evt) {
		this.style = 'background-color:rgba(58, 50, 200, 0.2)';
	}

	function listOff(evt) {
		this.style = 'background-color:transparent';
	}

	var listCount = bmdata.length;
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

		row.setAttribute('data-aid',bmdata[i].aid);
		row.setAttribute('data-xid',bmdata[i].xid);

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
		thumb.src = bmdata[i].imageurl;

		colImg.appendChild(thumb);

		/* page name */
		var colName = document.createElement('div');
		colName.setAttribute('class','col col-67 padtop');
		colName.innerHTML = bmdata[i].xname;

		/* page author */
		var colAuthor = document.createElement('div');
		colAuthor.setAttribute('class','col col-20 padtop');
		colAuthor.setAttribute('style','text-align:right');
		colAuthor.innerHTML = bmdata[i].author;

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

		dataselect.appendChild(row);
	}

	dash.appendChild(dataselect);

	return dash;
}

/*
	Function: dashExplore

	Create dash for exploring content by subject.

	Parameters:

		exploreHeader - string, the <h2> header title
		linkeRoute - string, the url route name links will go to (no domain or /)

	Returns:

		success - html node, explore dash
*/
function dashExplore(exploreHeader,linkRoute) {

	/* create main div for entire dash */
	var exploreDash = document.createElement('div');
	exploreDash.setAttribute('class','explore');

	/* create header for dash */
	var h2row = document.createElement('div');
	h2row.setAttribute('class','row');

	var h2col = document.createElement('div');
	h2col.setAttribute('class','col col-100');

	var h2 = document.createElement('h2');
	h2.innerHTML = exploreHeader;

	h2col.appendChild(h2);
	h2row.appendChild(h2col);
	exploreDash.appendChild(h2row);

	/* create div to hold links */
	var explore = document.createElement('div');
	explore.setAttribute('class','explore-links');
	exploreDash.appendChild(explore);

	/* get subjects for select topic list */
	var subjectsPromise = getSubjects();

	subjectsPromise.then(function(data) {
		var subjectsData = data;
		globalScope.subjects = subjectsData;

		function showTop() {
			/* first box - subject names */
			var subjectsNames = Object.keys(subjectsData);
			var subjectsCount = subjectsNames.length;

			emptyDiv(explore);

			/* create header for link section */
			var h3row = document.createElement('div');
			h3row.setAttribute('class','row');

			var h3col = document.createElement('div');
			h3col.setAttribute('class','col col-100');

			var h3 = document.createElement('h3');
			h3.innerHTML = 'Subjects';

			explore.appendChild(h3);

			for(var i = 0; i < subjectsCount; i++) {
				var currentSubject = subjectsNames[i];

				var subjectRow = document.createElement('div');
				subjectRow.setAttribute('class','row');

				var subjectCol = document.createElement('div');
				subjectCol.setAttribute('class','col col-100');

				var subjectBtn = btnSubmit(currentSubject,showSubject,'none');
				subjectBtn.setAttribute('data-subject',currentSubject);

				subjectCol.appendChild(subjectBtn);
				subjectRow.appendChild(subjectCol);

				explore.appendChild(subjectRow);
			}
		}

		showTop();

		function showCategory() {
			var topicRow = document.createElement('div');
			topicRow.setAttribute('class','row');

			/* make back btn & col */
			var backCol = document.createElement('div');
			backCol.setAttribute('class','col col-10');
			backCol.setAttribute('style','position:absolute;z-index:2;');

			var backBtn = btnSubmit('Back',showSubject,'red');
			backBtn.setAttribute('data-subject',this.getAttribute('data-subject'));
			backCol.appendChild(backBtn);

			/* create header for link section */
			var h3row = document.createElement('div');
			h3row.setAttribute('class','row');

			var h3col = document.createElement('div');
			h3col.setAttribute('class','col col-100');

			var h3 = document.createElement('h3');
			h3.innerHTML = 'Topics';

			h3row.appendChild(backCol);
			h3col.appendChild(h3);
			h3row.appendChild(h3col);
			topicRow.appendChild(h3row);

			/* make category col */
			var topicCol = document.createElement('div');
			topicCol.setAttribute('class','col col-100');

			/* append back & category columns */
			topicRow.appendChild(topicCol);

			/* add subject row to category col */
			var categoryRow = document.createElement('div');
			categoryRow.setAttribute('class','row');

			var categoryCol = document.createElement('div');
			categoryCol.setAttribute('class','col col-100');

			var categoryUrl = createURL('/' + linkRoute + '&subject=' + this.getAttribute('data-subject') + '&category=' + this.getAttribute('data-category'));
			var categoryBtn = btnLink('<b>' + this.getAttribute('data-category') + '</b>',categoryUrl,'none');

			categoryCol.appendChild(categoryBtn);

			categoryRow.appendChild(categoryCol);
			topicCol.appendChild(categoryRow);

			/* append categories to category column */
			var topicsNames = globalScope.subjects[this.getAttribute('data-subject')][this.getAttribute('data-category')];
			var topicsCount = topicsNames.length;

			for(var i = 0; i < topicsCount; i++) {
				var currentTopic = topicsNames[i];

				var currentTopicRow = document.createElement('div');
				currentTopicRow.setAttribute('class','row');

				var currentTopicCol = document.createElement('div');
				currentTopicCol.setAttribute('class','col col-100');

				var topicUrl = createURL('/' + linkRoute + '&subject=' + this.getAttribute('data-subject') + '&category=' + this.getAttribute('data-category') + '&topic=' + currentTopic);

				var currentTopicBtn = btnLink(currentTopic,topicUrl,'none');

				currentTopicCol.appendChild(currentTopicBtn);
				currentTopicRow.appendChild(currentTopicCol);

				topicCol.appendChild(currentTopicRow);
			}

			emptyDiv(explore);
			explore.appendChild(topicRow);
		}

		/* function for showing subject's categoris in explore div */
		function showSubject() {
			var categoryRow = document.createElement('div');
			categoryRow.setAttribute('class','row');

			/* make back btn & col */
			var backCol = document.createElement('div');
			backCol.setAttribute('class','col col-10');
			backCol.setAttribute('style','position:absolute;z-index:2;');

			var backBtn = btnSubmit('Back',showTop,'red');
			backCol.appendChild(backBtn);

			/* create header for link section */
			var h3row = document.createElement('div');
			h3row.setAttribute('class','row');

			var h3col = document.createElement('div');
			h3col.setAttribute('class','col col-100');

			var h3 = document.createElement('h3');
			h3.innerHTML = 'Categories';

			h3row.appendChild(backCol);
			h3col.appendChild(h3);
			h3row.appendChild(h3col);
			categoryRow.appendChild(h3row);

			/* make category col */
			var categoryCol = document.createElement('div');
			categoryCol.setAttribute('class','col col-100');

			/* append back & category columns */
			categoryRow.appendChild(categoryCol);

			/* add subject row to category col */
			var subjectRow = document.createElement('div');
			subjectRow.setAttribute('class','row');

			var subjectCol = document.createElement('div');
			subjectCol.setAttribute('class','col col-100');
			subjectCol.setAttribute('style','border-bottom-color:black;border-bottom-width:1px;');

			var subjectUrl = createURL('/' + linkRoute + '&subject=' + this.getAttribute('data-subject'));
			var subjectBtn = btnLink('<b>' + this.getAttribute('data-subject') + '</b>',subjectUrl,'none');
			subjectCol.appendChild(subjectBtn);

			subjectRow.appendChild(subjectCol);
			categoryCol.appendChild(subjectRow);

			/* append categories to category column */
			var categoryNames = Object.keys(globalScope.subjects[this.getAttribute('data-subject')]);
			var categoryCount = categoryNames.length;

			for(var i = 0; i < categoryCount; i++) {
				var currentCategory = categoryNames[i];

				var currentCategoryRow = document.createElement('div');
				currentCategoryRow.setAttribute('class','row');

				var currentCategoryCol = document.createElement('div');
				currentCategoryCol.setAttribute('class','col col-100');

				var currentCategoryBtn = btnSubmit(currentCategory,showCategory,'none');
				currentCategoryBtn.setAttribute('data-category',currentCategory);
				currentCategoryBtn.setAttribute('data-subject',this.getAttribute('data-subject'));

				currentCategoryCol.appendChild(currentCategoryBtn);
				currentCategoryRow.appendChild(currentCategoryCol);

				categoryCol.appendChild(currentCategoryRow);
			}

			/* empty the explore div and replace with categories */
			emptyDiv(explore);
			explore.appendChild(categoryRow);
		}
	},function(error) {
		alertify.alert("There Was An Error Getting The Subjects");
		if(error === "unknown") {
			journalError("getSubjects() unknown result.msg","nav.js",new Error().lineNumber,"","");
		}
	});

	return exploreDash;
}

/*
	Function: barFilter

	Make the form for filtering content searches.

	Parameters:

		sort - string, the type of sort already applied
		tags - string, the tags already applied

	Returns:

		success - html node, filter form
*/
function barFilter(sort,tags,keywords) {
	var row = document.createElement('div');
	row.setAttribute('class','row');

	var formDiv = document.createElement('form');
	formDiv.setAttribute('id','filterForm');
	formDiv.setAttribute('class','col col-70');
	formDiv.setAttribute('action','');

	/* start top row */
	var topRow = document.createElement('div');
	topRow.setAttribute('class','row');

	/* create category tag section */
	var colSort = document.createElement('div');
	colSort.setAttribute('class','col col-28');

	var SortSelect = document.createElement('select');
	SortSelect.setAttribute('id','sort');

	var options = ["rating","ranks","views","edited","created"];

	var sortIndex = 0;
	options.forEach(function(item,index) {
		var currentOption = document.createElement('option');
		currentOption.setAttribute('value',item);
		currentOption.innerHTML = item;
		SortSelect.appendChild(currentOption);

		if(item === sort) {
			sortIndex = index;
		}
	});

	colSort.appendChild(SortSelect);

	SortSelect.selectedIndex = sortIndex;

	/* get convert tag binary to decimal number */
	var tagTypes = parseInt(tags,2);

	/* set tag keys */
	globalScope.tagKeys = new Map([["none",0],["video",1],["audio",2],["image",4],["text",8],["math",16],["topic",32],["",64],["",128]]);

	/* create content type buttons */
	var colTypeVideo = document.createElement('div');
	colTypeVideo.setAttribute('class','col col-12');

	var checkVideo = document.createElement('button');
	checkVideo.setAttribute('class','checkbtn');
	checkVideo.setAttribute('type','button');
	checkVideo.setAttribute('name','checkType');
	checkVideo.setAttribute('value','video');
	checkVideo.setAttribute('onclick','toggleCheck(this);');
	checkVideo.innerHTML = "video";

	if(tagTypes & 1) {
		checkVideo.setAttribute('data-checked','true');
		checkVideo.style["color"] = "white";
		checkVideo.style["background-color"] = "blue";
	}

	colTypeVideo.appendChild(checkVideo);

	var colTypeAudio = document.createElement('div');
	colTypeAudio.setAttribute('class','col col-12');

	var checkAudio = document.createElement('button');
	checkAudio.setAttribute('class','checkbtn');
	checkAudio.setAttribute('type','button');
	checkAudio.setAttribute('name','checkType');
	checkAudio.setAttribute('value','audio');
	checkAudio.setAttribute('onclick','toggleCheck(this);');
	checkAudio.innerHTML = "audio";

	if(tagTypes & 2) {
		checkAudio.setAttribute('data-checked','true');
		checkAudio.style["color"] = "white";
		checkAudio.style["background-color"] = "blue";
	}

	colTypeAudio.appendChild(checkAudio);

	var colTypeImage = document.createElement('div');
	colTypeImage.setAttribute('class','col col-12');

	var checkImage = document.createElement('button');
	checkImage.setAttribute('class','checkbtn');
	checkImage.setAttribute('type','button');
	checkImage.setAttribute('name','checkType');
	checkImage.setAttribute('value','image');
	checkImage.setAttribute('onclick','toggleCheck(this);');
	checkImage.innerHTML = "image";

	if(tagTypes & 4) {
		checkImage.setAttribute('data-checked','true');
		checkImage.style["color"] = "white";
		checkImage.style["background-color"] = "blue";
	}

	colTypeImage.appendChild(checkImage);

	var colTypeText = document.createElement('div');
	colTypeText.setAttribute('class','col col-12');

	var checkText = document.createElement('button');
	checkText.setAttribute('class','checkbtn');
	checkText.setAttribute('type','button');
	checkText.setAttribute('name','checkType');
	checkText.setAttribute('value','text');
	checkText.setAttribute('onclick','toggleCheck(this);');
	checkText.innerHTML = "text";

	if(tagTypes & 8) {
		checkText.setAttribute('data-checked','true');
		checkText.style["color"] = "white";
		checkText.style["background-color"] = "blue";
	}

	colTypeText.appendChild(checkText);

	var colTypeMath = document.createElement('div');
	colTypeMath.setAttribute('class','col col-12');

	var checkMath = document.createElement('button');
	checkMath.setAttribute('class','checkbtn');
	checkMath.setAttribute('type','button');
	checkMath.setAttribute('name','checkType');
	checkMath.setAttribute('value','math');
	checkMath.setAttribute('onclick','toggleCheck(this);');
	checkMath.innerHTML = "math";

	if(tagTypes & 16) {
		checkMath.setAttribute('data-checked','true');
		checkMath.style["color"] = "white";
		checkMath.style["background-color"] = "blue";
	}

	colTypeMath.appendChild(checkMath);

	var colTypeCustom = document.createElement('div');
	colTypeCustom.setAttribute('class','col col-12');

	var checkCustom = document.createElement('button');
	checkCustom.setAttribute('class','checkbtn');
	checkCustom.setAttribute('type','button');
	checkCustom.setAttribute('name','checkType');
	checkCustom.setAttribute('value','topic');
	checkCustom.setAttribute('onclick','toggleCheck(this);');
	checkCustom.innerHTML = "topic";

	if(tagTypes & 32) {
		checkCustom.setAttribute('data-checked','true');
		checkCustom.style["color"] = "white";
		checkCustom.style["background-color"] = "blue";
	}

	colTypeCustom.appendChild(checkCustom);

	/* start bottom row */
	var bottomRow = document.createElement('div');
	bottomRow.setAttribute('class','row');

	/* only search bar goes in bottom row */
	var colSearch = barSearch('keywords',keywords);

	/* buttons for filter bar */
	var colFilterBtn = document.createElement('div');
	colFilterBtn.setAttribute('class','col col-15');

	function exploreWithFilter() {
		var form = document.getElementById('filterForm');

		/* get sort value */
		var sortValue = form.elements['sort'].options[form.elements['sort'].selectedIndex].value;

		/* get array of block types selected */
		var typeValue = [];
		var checkBtnLength = form.elements['checkType'].length;
		for(var k = 0; k < checkBtnLength; k++) {
			if(form.elements['checkType'][k].getAttribute('data-checked') === "true") {
				typeValue.push(form.elements['checkType'][k].value);
			}
		}

		/* create binary value of block types selected */
		var typeResult = 0;
		typeValue.forEach(function(item,index) {
			typeResult += globalScope.tagKeys.get(item);
		});

		/* create final binary tag of block types selected & tag category */
		var tagResult = ((typeResult) >>> 0).toString(2);

		/* get keywords */
		var keyWords = document.getElementById('keywords').value;
		keyWords.replace(/ /g,"_").replace(/[^a-zA-Z ]/g,"");

		/* set these into hidden divs for retrieval */
		var content = document.getElementById('queryContent').value;
		var subject = document.getElementById('querySubject').value;
		var category = document.getElementById('queryCategory').value;
		var topic = document.getElementById('queryTopic').value;

		var queryStringArray = ["/explore?content=",content,"&subject=",subject,"&category=",category,"&topic=",topic,"&sort=",sortValue,"&tags=",tagResult,"&keywords=",keyWords];

		window.location = createURL(queryStringArray.join(""));
	}

	var btnFilterApply = btnSubmit('Apply Filter',exploreWithFilter,'none');
	btnFilterApply.className += " filterbarbtn";
	colFilterBtn.appendChild(btnFilterApply);

	var colExpand = document.createElement('div');
	colExpand.setAttribute('class','col col-15');

	function expandAll() {
		var boxes = document.getElementsByClassName('content-box');
		var count = boxes.length;
		if(this.innerHTML === "Expand All") {
			for(var i = 0; i < count; i++) {
				boxes[i].children[1].setAttribute('style','display:block;visibility:visible;');
			}
			this.innerHTML = "Collapse All";
		} else {
			for(var j = 0; j < count; j++) {
				boxes[j].children[1].setAttribute('style','display:none;visibility:hidden;');
			}
			this.innerHTML = "Expand All";
		}
	}

	var btnExpandAll = btnSubmit('Expand All',expandAll,'none');
	btnExpandAll.className += " filterbarbtn";
	colExpand.appendChild(btnExpandAll);

	/* set some row styles */
	topRow.style["margin-left"] = "8px;";
	bottomRow.style["margin-left"] = "8px;";

	topRow.appendChild(colSort);
	topRow.appendChild(colTypeVideo);
	topRow.appendChild(colTypeAudio);
	topRow.appendChild(colTypeImage);
	topRow.appendChild(colTypeText);
	topRow.appendChild(colTypeMath);
	topRow.appendChild(colTypeCustom);
	bottomRow.appendChild(colSearch);
	formDiv.appendChild(topRow);
	formDiv.appendChild(bottomRow);
	row.appendChild(formDiv);
	row.appendChild(colFilterBtn);
	row.appendChild(colExpand);

	var filter = document.createElement('div');
	filter.setAttribute('class','filter-bar');
	filter.appendChild(row);

	return filter;
}

/*
	Function: formGenerateUserContent

	Make a user content form.

	Parameters:

		pagetype - string, the name of the type of content page to create.
		data - string, comma-separated like so: id,name,id,name etc.

	Returns:

		success - html node, user content creation form
*/
function formGenerateUserContent(pagetype,data) {
	var fullCapital;
	var capital;
	if(pagetype === 'page') {
		fullCapital = 'Pages';
		capital = 'Page';
	} else if(pagetype === 'guide') {
		fullCapital = 'Learning Guides';
		capital = 'LG';
	}

	/* create header */
	var rowHeader = document.createElement('div');
	rowHeader.setAttribute('class','row');

	var colHeader = document.createElement('div');
	colHeader.setAttribute('class','col col-100');

	var formHeader = document.createElement('h2');
	formHeader.innerHTML = fullCapital;

	colHeader.appendChild(formHeader);
	rowHeader.appendChild(colHeader);

	/* create new page form */
	var row_Content = document.createElement("div");
	row_Content.setAttribute("class","row");

	var colLeft_Content = document.createElement("div");
	colLeft_Content.setAttribute("class","col col-85");

	var colRight_Content = document.createElement("div");
	colRight_Content.setAttribute("class","col col-15");

	row_Content.appendChild(colLeft_Content);
	row_Content.appendChild(colRight_Content);

	/* input element is for page name */
	var title = document.createElement('input');
	title.setAttribute('type','text');
	title.setAttribute('class','log-input');
	title.setAttribute('name',pagetype + 'name-create');
	title.setAttribute('maxlength','50');
	title.setAttribute('placeholder','New ' + capital + ' Name');
	title.setAttribute('style','border-left-width:0px;');

	/* submit button that calls createpage() */
	var submit = btnSubmit("Create " + capital,"createpage('" + pagetype + "')","green");

	/* append elements to row */
	colLeft_Content.appendChild(title);
	colRight_Content.appendChild(submit);

	/* row 3 */
	var row_dataBox = document.createElement("div");
	row_dataBox.setAttribute("class","row");

	var colMiddle_dataBox = document.createElement("div");
	colMiddle_dataBox.setAttribute("class","col col-100");

	/* create a div to hold the page links */
	var datadiv = document.createElement('div');
	datadiv.setAttribute('class',pagetype + 'list');

	/* append elements to row 3 */
	row_dataBox.appendChild(datadiv);

	/* create select multiple box for page names */
	var selectBox = document.createElement('select');
	selectBox.setAttribute('multiple','true');
	selectBox.setAttribute('id',pagetype + '-select');

	/* append elements to datadiv */
	datadiv.appendChild(selectBox);

	/* get the page data from comma-separated string */
	var dataarray = data.split(',');

	/* get number of pages, each page has two data (link,name), so 1 is empty */
	var count;
	if(dataarray.length === 1) {
		count = 0;
	} else {
		count = dataarray.length / 2;
	}
	var origCount = count;

	/* sort the data by name */
	var i = 0;
	var idNameArray = [];
	while(count > 0) {
		var currentPage = {};
		currentPage['id'] = dataarray[i];
		currentPage['name'] = dataarray[i + 1];
		idNameArray.push(currentPage);
		i += 2;
		count--;
	}

	idNameArray.sort(function(a,b) {
		if(a['name'].toUpperCase() < b['name'].toUpperCase()) {
			return -1;
		} else if(a['name'].toUpperCase() > b['name'].toUpperCase()) {
			return 1;
		} else {
			return 0;
		}
	});

	/* create page links and append to data div */
	i = 0;
	count = origCount;
	while(count > 0) {
		var option = document.createElement('option');
		option.setAttribute('value',idNameArray[i]['id']);
		option.innerHTML = idNameArray[i]['name'];
		selectBox.appendChild(option);

		i++;
		count--;
	}

	/* row 4 */
	var row_dataSubmitButtons = document.createElement("div");
	row_dataSubmitButtons.setAttribute("class","row");

	var colLeft_dataSubmitButtons = document.createElement("div");
	colLeft_dataSubmitButtons.setAttribute("class","col col-80");

	var colRight_dataSubmitButtons = document.createElement("div");
	colRight_dataSubmitButtons.setAttribute("class","col col-20");

	row_dataSubmitButtons.appendChild(colLeft_dataSubmitButtons);
	row_dataSubmitButtons.appendChild(colRight_dataSubmitButtons);

	/* this function is called when a block page link is clicked on */
	function goToPage() {
		var selectBox = document.getElementById(pagetype + "-select");
		var dataop = selectBox.value;

		if(dataop === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			var link = createURL("/edit" + pagetype + "?" + pagetype + "=" + dataop);
			window.open(link,"_self");
		}
	}

	/* create submit button for go to page */
	var goToPageBtn = btnSubmit("Go To " + capital,goToPage,"green");

	/* this function is called to double check deleting a block page */
	function deletePageConfirm() {
		var selectBox = document.getElementById(pagetype + "-select");
		var datapage = selectBox.value;

		if(datapage === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			alertify.confirm("Are You Sure You Want To Delete This? This Is Permanent.",function(accepted) {
				if (accepted) {
					deletePage(pagetype,datapage);
				} else {
					// user clicked "cancel"
				}
			});
		}
	}

	/* create delete page button */
	var deletePageBtn = btnSubmit("Delete " + capital,deletePageConfirm,"red");

	/* append elements to row 4 */
	colLeft_dataSubmitButtons.appendChild(goToPageBtn);
	colRight_dataSubmitButtons.appendChild(deletePageBtn);

	/* append the page links to a form div */
	var generateUserContentDiv = document.createElement('div');
	generateUserContentDiv.setAttribute('class','page-gen');
	generateUserContentDiv.setAttribute('id',pagetype + '-gen');
	generateUserContentDiv.appendChild(rowHeader);
	generateUserContentDiv.appendChild(row_Content);
	generateUserContentDiv.appendChild(row_dataBox);
	generateUserContentDiv.appendChild(row_dataSubmitButtons);

	return generateUserContentDiv;
}

/*
	Function: rowProfileCheck

	Creates a profile row div when input must be validated (like chaning a password, requires entering current & new password). The back end must have a check for accepting the check and field names. Probably in the route function that saves profile data.

	Parameters:

		check - string, the name of the field to validate
		field - string, the name of the new data field
		placeholders - an array with two strings, first the placeholder text for check, second for field
		description - string, short description shown on the left of input tag

	Returns:

		success - html node, profile row div
*/
function rowProfileCheck(check,field,placeholders,description) {
	var row = document.createElement("div");
	row.setAttribute("class","row profile-row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-15");

	var colMiddleLeft = document.createElement("div");
	colMiddleLeft.setAttribute("class","col col-35 pad-10-left");

	var colMiddleRight = document.createElement("div");
	colMiddleRight.setAttribute("class","col col-35 pad-10-right");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-15");

	/* title */
	var profileTitle = document.createElement('div');
	profileTitle.setAttribute('class','profile-title');
	profileTitle.innerHTML = description;

	/* first input */
	var first = document.createElement('input');
	first.setAttribute('type','password');
	first.setAttribute('name',check);
	first.setAttribute('class','text-input');
	first.setAttribute('maxlength','50');
	first.setAttribute('placeholder',placeholders[0]);

	/* second input */
	var second = document.createElement('input');
	second.setAttribute('type','password');
	second.setAttribute('name',field);
	second.setAttribute('class','text-input');
	second.setAttribute('maxlength','50');
	second.setAttribute('placeholder',placeholders[1]);

	/* save btn */
	var saveBtn = document.createElement('button');
	saveBtn.setAttribute('type','button');
	saveBtn.setAttribute('name','save-' + field);
	saveBtn.setAttribute('class','menubtn green-btn');
	saveBtn.setAttribute('onclick','saveProfileInfo(this,["' + check + '","' + field + '"])');
	saveBtn.innerHTML = "Save";

	colLeft.appendChild(profileTitle);
	colMiddleLeft.appendChild(first);
	colMiddleRight.appendChild(second);
	colRight.appendChild(saveBtn);

	row.appendChild(colLeft);
	row.appendChild(colMiddleLeft);
	row.appendChild(colMiddleRight);
	row.appendChild(colRight);

	return row;
}

/*
	Function: rowProfileSingle

	Creates a profile row div.

	Parameters:

		field - string, the name of the field, must match the column name in MySQL database
		description - string, short description shown on the left of input tag
		data - the current profile data for that field, will populate the input tag

	Returns:

		success - html node, profile row div
*/
function rowProfileSingle(field,description,data) {

	var row = document.createElement("div");
	row.setAttribute("class","row profile-row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-15");

	var colMiddle = document.createElement("div");
	colMiddle.setAttribute("class","col col-70 pad-10");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-15");

	/* title */
	var profileTitle = document.createElement('div');
	profileTitle.setAttribute('class','profile-title');
	profileTitle.innerHTML = description;

	/* username input */
	var fieldInput = document.createElement('input');
	fieldInput.setAttribute('type','text');
	fieldInput.setAttribute('name',field);
	fieldInput.setAttribute('class','text-input');
	fieldInput.setAttribute('maxlength','50');
	fieldInput.setAttribute('value',data);

	/* save username btn */
	var saveBtn = document.createElement('button');
	saveBtn.setAttribute('type','button');
	saveBtn.setAttribute('name','save-' + field);
	saveBtn.setAttribute('class','menubtn green-btn');
	saveBtn.setAttribute('onclick','saveProfileInfo(this,["' + field + '"])');
	saveBtn.innerHTML = "Save";

	colLeft.appendChild(profileTitle);
	colMiddle.appendChild(fieldInput);
	colRight.appendChild(saveBtn);

	row.appendChild(colLeft);
	row.appendChild(colMiddle);
	row.appendChild(colRight);

	return row;
}

// <<<fold>>>

/***
	Section: Page Functions
	These are functions for displaying full pages. They are commonly called by the back-end.
***/

// <<<code>>>

/*
	Function: pageExplore

	Displays the page for exploring content.

	Parameters:

		logstatus - boolean, whether the user is logged in or out
		csct - array, content subject category topic sort tags keywords
		data - string, @@ delineated search data

	Returns:

		nothing - *
*/
function pageExplore(logstatus,csct,data) {
	var main = document.getElementById('content');

	/* get user cookies for bookmarks */
	var userObj = getCookies();

	/* create and append menu based on log status */
	var menu;
	if(logstatus === true) {
		menu = barMenu();
	} else {
		menu = barLog();
	}
	main.appendChild(menu);

	/* determine bp or lg */
	var prefixResource;
	var pagetype;
	if(csct[0] === "bp") {
		prefixResource = "/page";
		pagetype = "page";
	} else if(csct[0] === "lg") {
		prefixResource = "/guide";
		pagetype = "guide";
	} else {
		prefixResource = "/error";
	}

	/* append content subject category topic to hidden divs */
	var contentHidden = document.createElement('input');
	contentHidden.setAttribute('type','hidden');
	contentHidden.setAttribute('value',csct[0]);
	contentHidden.setAttribute('id','queryContent');
	var subjectHidden = document.createElement('input');
	subjectHidden.setAttribute('type','hidden');
	subjectHidden.setAttribute('value',csct[1]);
	subjectHidden.setAttribute('id','querySubject');
	var categoryHidden = document.createElement('input');
	categoryHidden.setAttribute('type','hidden');
	categoryHidden.setAttribute('value',csct[2]);
	categoryHidden.setAttribute('id','queryCategory');
	var topicHidden = document.createElement('input');
	topicHidden.setAttribute('type','hidden');
	topicHidden.setAttribute('value',csct[3]);
	topicHidden.setAttribute('id','queryTopic');

	main.appendChild(contentHidden).appendChild(subjectHidden).appendChild(categoryHidden).appendChild(topicHidden);

	/* create filter menu */
	var filter = barFilter(csct[4],csct[5],csct[6]);
	main.appendChild(filter);

	/* create box template */
	var box = boxCreate();

	/* loop through links & insert data into boxes */
	var index = 0;
	var searchCount = data.length;
	while(index < searchCount) {
		var newBox = box.cloneNode(true);
		newBox.setAttribute('id',index);

		/* page name */
		var pageURL = createURL(prefixResource + "?a=" + data[index].uid + "&p=" + data[index].xid);
		var pageLink = document.createElement('a');
		pageLink.setAttribute('href',pageURL);
		pageLink.innerHTML = data[index].xname;
		newBox.querySelector(".box-title").appendChild(pageLink);

		/* author */
		newBox.querySelector(".box-author").innerHTML = data[index].author;

		/* rating */
		newBox.querySelector(".rating-bar").className += " w" + (data[index].rating - (data[index].rating % 10));
		newBox.querySelector(".rating-bar").style = "width:" + data[index].rating + "%";

		/* bookmark */
		newBox.querySelector(".bmark").setAttribute('data-aid',data[index].uid);
		newBox.querySelector(".bmark").setAttribute('data-pid',data[index].xid);

		newBox.querySelector(".bmark").addEventListener('change',setBookmark);

		if(userObj.hasOwnProperty('bm')) {
			if(userObj.bm.hasOwnProperty(pagetype)) {
				if(userObj.bm[pagetype].hasOwnProperty(data[index].uid)) {
					if(userObj.bm[pagetype][data[index].uid].indexOf(data[index].xid) > -1) {
						newBox.querySelector(".bmark").checked = true;
					} else {
						newBox.querySelector(".bmark").checked = false;
					}
				} else {
					newBox.querySelector(".bmark").checked = false;
				}
			}
		}

		/* image */
		var pageImage = document.createElement('img');
		pageImage.setAttribute('class','explore-img');
		pageImage.setAttribute('src',data[index].imageurl);
		newBox.querySelector(".box-image").appendChild(pageImage);

		/* blurb */
		newBox.querySelector(".box-blurb").innerHTML = data[index].blurb;

		/* created date */
		var cDateArray = data[index].created.split(/[- :T]/);
		var createdDate = cDateArray[1] + "/" + cDateArray[2] + "/" + cDateArray[0];
		newBox.querySelector(".box-created").innerHTML = "created: " + createdDate;

		/* edited date */
		var eDateArray = data[index].edited.split(/[- :T]/);
		var editedDate = eDateArray[1] + "/" + eDateArray[2] + "/" + eDateArray[0];
		newBox.querySelector(".box-edited").innerHTML = "edited: " + editedDate;

		/* ranks */
		newBox.querySelector(".box-ranks").innerHTML = "ranks: " + data[index].ranks;

		/* views */
		newBox.querySelector(".box-views").innerHTML = "views: " + data[index].views;

		/* append the new box */
		main.appendChild(newBox);
		index++;
	}
}

/*
	Function: pageHome

	Displays the Home Page (index page for logged in users). Currently displays log out button, makes and shows page creation form, and fetches and links to existing user pages.

	Parameters:

		none

	Returns:

		nothing - *
*/
function pageHome() {
	var main = document.getElementById('content');

	/* append the form to the main div */
	var menu = barMenu();
	main.appendChild(menu);

	/* fetch page data for user bookmarks */
	var promiseBM = getBookmarkData("page");

	/* fetch user pages */
	var promiseBP = getPages("page");

	/* fetch user learning guides */
	var promiseLG = getPages("guide");

	Promise.all([promiseBM,promiseBP,promiseLG]).then(function(values) {
		/* bookmark display form */
		var row_Bookmark = formDisplayPlaylist('Bookmarks: Pages',values[0]);
		main.appendChild(row_Bookmark);

		/* block page create form */
		var row_PageCreate = formGenerateUserContent('page',values[1]);
		main.appendChild(row_PageCreate);

		/* learning guide create form */
		var row_LgCreate = formGenerateUserContent('guide',values[2]);
		main.appendChild(row_LgCreate);
	},function(error) {
		alertify.alert("There Was An Error Getting Your Pages.");
	});
}

/*
	Function: pageLanding

	Dispaly the landing page. The logstatus is used purely for displaying a login/signup form vs a link to the home page. Do not use it to display any sensitive data.

	Parameters:

		logstatus - boolean, true if logged in or false otherwise.

	Returns:

		nothing - *
*/
function pageLanding(logstatus) {

	var main = document.getElementById('content');

	/* create and append menu based on log status */
	var menu;
	if(logstatus === true) {
		menu = barMenu();
	} else {
		menu = barLog();
	}
	main.appendChild(menu);

	/* search bar */
	var search = barSearch('fullsearch','');
	search.setAttribute('style','margin-top: 8px;');
	main.appendChild(search);

	/* pages div */
	var explorePages = dashExplore('Pages','explore?content=bp');
	main.appendChild(explorePages);

	/* learning guide div */
	var exploreLGs = dashExplore('Learning Guides','explore?content=lg');
	main.appendChild(exploreLGs);
}

/*
	Function: pageProfile

	This function displays a user's profile page.

	Parameters:

		profiledata - the user's profile data

	Returns:

		nothing - *
*/
function pageProfile(profiledata) {
	var profileinfo = JSON.parse(profiledata);

	/* MENU */

	/* create menu */
	var menu = barMenu();

	/* PROFILE */

	/* create a div to hold the page links */
	var profilediv = document.createElement('div');
	profilediv.setAttribute('class','profile-list');

	/* make mandatory profile rows */
	var row_Username = rowProfileSingle("username","Username:",profileinfo.username);
	var row_Password = rowProfileCheck("currentPass","newPass",["Current Password","New Password"],"Password:");
	var row_Autosave = rowProfileSingle("bengine-autosave","Auto Save:",profileinfo.autosave);
	var row_DefaultText = rowProfileSingle("defaulttext","Default Text:",profileinfo.defaulttext);

	/* make recovery profile rows */
	var row_Email = rowProfileSingle("email","Email:",profileinfo.email);
	var row_Phone = rowProfileSingle("phone","Phone:",profileinfo.phone);

	/* make optional profile rows */

	/* append rows to profilediv */
	profilediv.appendChild(row_Username);
	profilediv.appendChild(row_Password);
	profilediv.appendChild(row_Autosave);
	profilediv.appendChild(row_DefaultText);
	profilediv.appendChild(row_Email);
	profilediv.appendChild(row_Phone);

	/* MAIN */

	/* grab the main div and append all of these elements */
	var main = document.getElementById('content');
	main.appendChild(menu);
	main.appendChild(profilediv);
}

// <<<fold>>>

/***
	Section: AJAX Functions
	These functions send ajax requests
***/

// <<<code>>>

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
	var url = createURL("/login");

	/* get the entered username and password */
	var username = document.getElementsByName('username-login')[0].value;
	var password = document.getElementsByName('password-login')[0].value;

	/// instant validation needed

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "username=" + username + "&password=" + password;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'loggedin':
						window.location = createURL("/home"); break;
					case 'incorrect':
						alertify.alert("The Passowrd Was Incorrect"); break;
					case 'notfound':
						alertify.alert("The Username Could Not Be Found"); break;
					case 'err':
					default:
						alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

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
	var url = createURL("/signup");

	/* get the user information */
	var username = document.getElementsByName('username-signup')[0].value;
	var email = document.getElementsByName('email-signup')[0].value;
	var password = document.getElementsByName('password-signup')[0].value;
	var passwordcheck = document.getElementsByName('password-signup-check')[0].value;

	/* check that the passwords match */
	if(password !== passwordcheck) {
		alertify.alert("The Passwords You Entered Do Not Match.");
		return;
	}

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "username=" + username + "&email=" + email + "&password=" + password;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'success':
						window.location = createURL("/home"); break;
					case 'exists':
						alertify.alert("That Username Already Exists.\nPlease Choose A Different One."); break;
					case 'err':
					default:
						alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

/*
	Function: createpage

	This function creates a user page.

	Parameters:

		pagetype - string, ["page","guide"]

	Returns:

		nothing - *
*/
function createpage(pagetype) {

	/* create the url destination for the ajax request */
	var url = createURL("/createpage");

	/* get the page name */
	var xname = document.getElementsByName(pagetype + 'name-create')[0].value;

	if(xname === "") {
		alertify.alert("Please Enter A Name.");
	} else {
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		var params = "xname=" + xname + "&pt=" + pagetype;

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					var result = JSON.parse(xmlhttp.responseText);

					switch(result.msg) {
						case "success":
							/* insert page into select box */
							var selectBox = document.getElementById(pagetype + '-select');
							var optLength = selectBox.length;

							var option = document.createElement("option");
							option.text = xname;
							option.value = result.data.xid;

							for(var i = 0; i < optLength + 1; i++) {
								if(i === optLength || selectBox.options[i].text.toUpperCase() > xname.toUpperCase()) {
									selectBox.add(option,i);
									break;
								}
							}
							break;
						case "pageexists":
							alertify.alert("You Already Have A Page With That Name."); break;
						case "nocreateloggedout":
							alertify.alert("Unable To Create Page. You Are Logged Out."); break;
						case "err":
						default:
							alertify.alert("An Error Occured. Please Try Again Later."); break;
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send(params);
	}
}

/*
	Function: deletePage

	This function deletes the selected user block page.

	Parameters:

		xid - page id

	Returns:

		none - *
*/
function deletePage(pagetype,xid) {
	/* create the url destination for the ajax request */
	var url = createURL("/deletepage");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "xid=" + xid + "&pt=" + pagetype;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'success':
						var selectBox = document.getElementById(pagetype + '-select');
						var count = selectBox.length;
						var optionToRemove;
						for(var i = 0; i < count; i++) {
							if(selectBox.options[i].value === xid) {
								optionToRemove = selectBox.options[i];
							}
						}
						selectBox.removeChild(optionToRemove);
						break;
					case 'nodeleteloggedout':
						alertify.alert("Could Not Delete Page. You Are Logged Out."); break;
					case 'err':
					default:
						alertify.alert("There Was A Problem Deleting The Page.");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
		}
	};

	xmlhttp.send(params);
}

/*
	Function: getBookmarkData

	This function fetches page data for a user's bookmarks.

	Parameters:

		none

	Returns:

		success - promise, pagedata
*/
function getBookmarkData(pagetype) {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getbmdata");

		var params = "pagetype=" + pagetype;

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					var result = JSON.parse(xmlhttp.responseText);

					switch(result.msg) {
						case 'success':
							resolve(result.data.bmdata); break;
						case 'err':
						default:
							reject('err');
					}
				} else {
					alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
			}
		};

		xmlhttp.send(params);
	});

	return promise;
}

/*
	Function: getPages

	This function fetches a user's pages. It returns a promise containing page data in the following format (xid,xname,)

	Parameters:

		pagetype - string, ["guide","page"]

	Returns:

		success - promise, pagedata
*/
function getPages(pagetype) {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getpages?pt=" + pagetype);

		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					var result = JSON.parse(xmlhttp.responseText);

					switch(result.msg) {
						case 'success':
							resolve(result.data.pages); break;
						case 'err':
						default:
							reject('err');
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
	Function: saveProfileInfo

	This function save profile data on the profile page.

	Parameters:

		btn - the button tag that was clicked. should be passed in with 'this' keyword.
		fields - an array of field parameters which should match the 'name' field of the input holding the data.

	Returns:

		nothing - *
*/
function saveProfileInfo(btn,fields) {

	var params = "";
	var i = 0;
	var count = fields.length;

	if(count > 0) {
		params = fields[i] + "=" + document.getElementsByName(fields[i])[0].value;
		i++;
	}
	while(i < count) {
		params += "&" + fields[i] + "=" + document.getElementsByName(fields[i])[0].value;
		i++;
	}

	/* create the url destination for the ajax request */
	var url = createURL("/saveprofile");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				var result = JSON.parse(xmlhttp.responseText);

				switch(result.msg) {
					case 'profilesaved':
						btn.style = "background-color: #00ffe1";
						alertify.log("Saved!","success"); break;
					case 'nomatch':
						btn.style = "background-color: #e83e3e";
						alertify.alert("The Current Value Did Not Match."); break;
					case 'nosaveloggedout':
						btn.style = "background-color: #e83e3e";
						alertify.alert("You Can't Save Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again."); break;
					case 'err':
					default:
						btn.style = "background-color: #e83e3e";
						alertify.alert("An Unknown Error Occurred");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    };

	xmlhttp.send(params);
}

// <<<fold>>>
