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
	global createURL:true
	global emptyDiv:true
	global btnLink:true
	global btnSubmit:true
	global getUserFields:true
	global barLog:true
	global barMenu:true
	global getSubjects:true
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
	Function: barLog

	Creates the log in & sign up form.

	Parameters:

		* - none

	Returns:

		success - html node, log in sign up div
*/
function barLog() {

	/* create parent <div> */
	var logBar = document.createElement('div');
	logBar.setAttribute('class','log-bar');
	logBar.setAttribute('id','form-login');

	/* create top row */
	var rowTop = document.createElement('div');
	rowTop.setAttribute('class','row');
	rowTop.setAttribute('id','top-bar');

	function expandLog() {
		/* create empty col */
		var colEmptyLog = document.createElement('div');
		colEmptyLog.setAttribute('class','col col-50');

		/* create username column */
		var colUsername = document.createElement('div');
		colUsername.setAttribute('class','col col-20');

		/* create username text <input> */
		var username = document.createElement('input');
		username.setAttribute('class','log-input');
		username.setAttribute('type','text');
		username.setAttribute('name','username-login');
		username.setAttribute('maxlength','50');
		username.setAttribute('placeholder','User Name');
		username.setAttribute('style','border-left-width:2px;');

		colUsername.appendChild(username);

		/* create password column */
		var colPassword = document.createElement('div');
		colPassword.setAttribute('class','col col-20');

		/* create password <input> */
		var password = document.createElement('input');
		password.setAttribute('class','log-input');
		password.setAttribute('type','password');
		password.setAttribute('name','password-login');
		password.setAttribute('maxlength','32');
		password.setAttribute('placeholder','Password');

		colPassword.appendChild(password);

		/* create submit button column */
		var colSubmit = document.createElement('div');
		colSubmit.setAttribute('class','col col-10');

		/* create form submit <button> */
		var submit = btnSubmit('Log In','login()','green');
		submit.setAttribute('style','border-color:black;border-left-width:1px;');

		colSubmit.appendChild(submit);

		emptyDiv(rowTop);
		rowTop.appendChild(colEmptyLog);
		rowTop.appendChild(colUsername);
		rowTop.appendChild(colPassword);
		rowTop.appendChild(colSubmit);
	}

	function expandSign() {
		var sign = formSignUp();

		emptyDiv(rowTop);
		rowTop.appendChild(sign);
	}

	/* create expand buttons */
	var logBtn = btnSubmit('Log In',expandLog,'none');
	var signBtn = btnSubmit('Sign Up',expandSign,'none');

	/* create columns */
	var colEmpty = document.createElement('div');
	colEmpty.setAttribute('class','col col-70');

	var colLogBtn = document.createElement('div');
	colLogBtn.setAttribute('class','col col-15');
	colLogBtn.appendChild(logBtn);

	var colSignBtn = document.createElement('div');
	colSignBtn.setAttribute('class','col col-15');
	colSignBtn.appendChild(signBtn);

	/* add columns to top row */
	rowTop.appendChild(colEmpty);
	rowTop.appendChild(colLogBtn);
	rowTop.appendChild(colSignBtn);

	/* append the elements to the parent <div> */
	logBar.appendChild(rowTop);

	return logBar;
}

/*
	Function: barSearch

	Creates the search bar.

	Parameters:

		* - none

	Returns:

		success - html node, search div
*/
function barSearch() {
	/* create the search input */
	var searchDiv = document.createElement('div');
	searchDiv.setAttribute('class','search-bar');

	var searchRow = document.createElement('div');
	searchRow.setAttribute('class','row');

	var searchCol = document.createElement('div');
	searchCol.setAttribute('class','col col-100');

	var searchBar = document.createElement('input');
	searchBar.setAttribute('class','text-input');
	searchBar.setAttribute('type','search');
	searchBar.setAttribute('placeholder','Search');

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

	var star = document.createElement('input');
	star.setAttribute('type','checkbox');
	star.setAttribute('class','star');
	bookmark.appendChild(star);

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
	Function: dashBookmarks

	Create dash for viewing users bookmarks.

	Parameters:

		none

	Returns:

		success - html node, bookmarks dash
*/
function dashBookmarks() {
	/* create header */
	var rowHeader = document.createElement('div');
	rowHeader.setAttribute('class','row');

	var colHeader = document.createElement('div');
	colHeader.setAttribute('class','col col-100');

	var dashHeader = document.createElement('h2');
	dashHeader.innerHTML = "Bookmarks";

	colHeader.appendChild(dashHeader);
	rowHeader.appendChild(colHeader);

	/* append the page links to a form div */
	var dashBookmarks = document.createElement('div');
	dashBookmarks.setAttribute('class','bookmarks-box');
	dashBookmarks.appendChild(rowHeader);

	return dashBookmarks;
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

	subjectsPromise.then(function(success) {
		var subjectsData = JSON.parse(success);
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
		/// handle error
	});

	return exploreDash;
}

/*
	Function: barFilter

	Make the form for filtering content searches.

	Parameters:

		none

	Returns:

		success - html node, filter form
*/
function barFilter() {
	var row = document.createElement('div');
	row.setAttribute('class','row');

	var colRating = document.createElement('div');
	colRating.setAttribute('class','col col-15');

	var minRating = document.createElement('input');
	minRating.setAttribute('id','min-rating');
	minRating.setAttribute('placeholder','min rating');

	var maxRating = document.createElement('input');
	maxRating.setAttribute('id','max-rating');
	maxRating.setAttribute('placeholder','max rating');

	colRating.appendChild(minRating);
	colRating.appendChild(maxRating);

	var colRanks = document.createElement('div');
	colRanks.setAttribute('class','col col-20');

	var minRanks = document.createElement('input');
	minRanks.setAttribute('id','min-ranks');
	minRanks.setAttribute('placeholder','min ranks');

	var maxRanks = document.createElement('input');
	maxRanks.setAttribute('id','max-ranks');
	maxRanks.setAttribute('placeholder','max ranks');

	colRanks.appendChild(minRanks);
	colRanks.appendChild(maxRanks);

	var colViews = document.createElement('div');
	colViews.setAttribute('class','col col-20');

	var minViews = document.createElement('input');
	minViews.setAttribute('id','min-views');
	minViews.setAttribute('placeholder','min views');

	var maxViews = document.createElement('input');
	maxViews.setAttribute('id','max-views');
	maxViews.setAttribute('placeholder','max views');

	colViews.appendChild(minViews);
	colViews.appendChild(maxViews);

	var colDate = document.createElement('div');
	colDate.setAttribute('class','col col-15');

	var minDate = document.createElement('input');
	minDate.setAttribute('id','min-date');
	minDate.setAttribute('placeholder','min date');

	var maxDate = document.createElement('input');
	maxDate.setAttribute('id','max-date');
	maxDate.setAttribute('placeholder','max date');

	colDate.appendChild(minDate);
	colDate.appendChild(maxDate);

	var colFilterBtn = document.createElement('div');
	colFilterBtn.setAttribute('class','col col-15');

	var btnFilterApply = btnSubmit('Apply Filter','','none');
	btnFilterApply.className += " savebar";
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
	btnExpandAll.className += " savebar";
	colExpand.appendChild(btnExpandAll);

	row.appendChild(colRating);
	row.appendChild(colRanks);
	row.appendChild(colViews);
	row.appendChild(colDate);
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

		type - string, the name of the type of content page to create.
		data - string, comma-separated like so: id,name,id,name etc.

	Returns:

		success - html node, user content creation form
*/
function formGenerateUserContent(type,data) {
	var fullCapital;
	var capital;
	var lower;
	var deleteFunc;
	if(type === 'blockpage') {
		fullCapital = 'Pages';
		capital = 'Page';
		lower = 'page';
		deleteFunc = deletePage;
	} else if(type === 'lg') {
		fullCapital = 'Learning Guides';
		capital = 'LG';
		lower = 'lg';
		deleteFunc = deleteLG;
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
	title.setAttribute('name',lower + 'name-create');
	title.setAttribute('maxlength','50');
	title.setAttribute('placeholder','New ' + capital + ' Name');
	title.setAttribute('style','border-left-width:0px;');

	/* submit button that calls createpage() */
	var submit = btnSubmit("Create " + capital,"create" + lower + "()","green");

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
	datadiv.setAttribute('class',lower + 'list');

	/* append elements to row 3 */
	row_dataBox.appendChild(datadiv);

	/* create select multiple box for page names */
	var selectBox = document.createElement('select');
	selectBox.setAttribute('multiple','true');
	selectBox.setAttribute('id',lower + '-select');

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
		if(a['name'] < b['name']) {
			return -1;
		} else if(a['name'] > b['name']) {
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
		var selectBox = document.getElementById(lower + "-select");
		var dataop = selectBox.value;

		if(dataop === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			var link = createURL("/edit" + lower + "?" + lower + "=" + dataop);
			window.open(link,"_self");
		}
	}

	/* create submit button for go to page */
	var goToPageBtn = btnSubmit("Go To " + capital,goToPage,"green");

	/* this function is called to double check deleting a block page */
	function deletePageConfirm() {
		var selectBox = document.getElementById(lower + "-select");
		var datapage = selectBox.value;

		if(datapage === "") {
			alertify.alert("Please Select A " + capital);
		} else {
			alertify.confirm("Are You Sure You Want To Delete This? This Is Permanent.",function(accepted) {
				if (accepted) {
					deleteFunc(datapage);
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
	generateUserContentDiv.setAttribute('id',type + '-gen');
	generateUserContentDiv.appendChild(rowHeader);
	generateUserContentDiv.appendChild(row_Content);
	generateUserContentDiv.appendChild(row_dataBox);
	generateUserContentDiv.appendChild(row_dataSubmitButtons);

	return generateUserContentDiv;
}

/*
	Function: formSignUp

	Create a sign up form. This returns an html node containing the form. On submit, the form calls signup()

	Parameters:

		none

	Form:

		username-signup - the user name
		email-signup - the user's email
		phone-signup - the user's phone
		password-signup - the password
		password-signup-check - the password again

	Returns:

		success - html node, sign up form
*/
function formSignUp() {

	/* create parent <div> */
	var signup = document.createElement('div');
	signup.setAttribute('class','form');
	signup.setAttribute('id','form-signup');

	/* username column */
	var colUsername = document.createElement('div');
	colUsername.setAttribute('class','col col-17');

	/* create username text <input> */
	var username = document.createElement('input');
	username.setAttribute('class','log-input');
	username.setAttribute('type','text');
	username.setAttribute('name','username-signup');
	username.setAttribute('maxlength','50');
	username.setAttribute('placeholder','User Name');
	username.setAttribute('style','border-left-width:0px;');
	colUsername.appendChild(username);

	/* email column */
	var colEmail = document.createElement('div');
	colEmail.setAttribute('class','col col-17');

	/* create email text <input> */
	var email = document.createElement('input');
	email.setAttribute('class','log-input');
	email.setAttribute('type','text');
	email.setAttribute('name','email-signup');
	email.setAttribute('maxlength','50');
	email.setAttribute('placeholder','Email - optional');
	colEmail.appendChild(email);

	/* phone column */
	var colPhone = document.createElement('div');
	colPhone.setAttribute('class','col col-17');

	/* create phone text <input> */
	var phone = document.createElement('input');
	phone.setAttribute('class','log-input');
	phone.setAttribute('type','text');
	phone.setAttribute('name','phone-signup');
	phone.setAttribute('maxlength','17');
	phone.setAttribute('placeholder','Phone - optional');
	colPhone.appendChild(phone);

	/* password column */
	var colPassword = document.createElement('div');
	colPassword.setAttribute('class','col col-17');

	/* create password <input> */
	var password = document.createElement('input');
	password.setAttribute('class','log-input');
	password.setAttribute('type','password');
	password.setAttribute('name','password-signup');
	password.setAttribute('maxlength','32');
	password.setAttribute('placeholder','Password');
	colPassword.appendChild(password);

	/* password check column */
	var colPasswordc = document.createElement('div');
	colPasswordc.setAttribute('class','col col-17');

	/* create another password <input> */
	var passwordc = document.createElement('input');
	passwordc.setAttribute('class','log-input');
	passwordc.setAttribute('type','password');
	passwordc.setAttribute('name','password-signup-check');
	passwordc.setAttribute('maxlength','32');
	passwordc.setAttribute('placeholder','Repeat Password');
	colPasswordc.appendChild(passwordc);

	/* submit button column */
	var colSubmit = document.createElement('div');
	colSubmit.setAttribute('class','col col-15');

	/* create form submit <button> */
	var submit = btnSubmit('Sign Up','signup()','green');
	submit.setAttribute('value','submit-signup');
	submit.setAttribute('style','border-color:black;border-left-width:1px;');
	colSubmit.appendChild(submit);

	/* append the elements to the parent <div> */
	signup.appendChild(colUsername);
	signup.appendChild(colEmail);
	signup.appendChild(colPhone);
	signup.appendChild(colPassword);
	signup.appendChild(colPasswordc);
	signup.appendChild(colSubmit);

	return signup;
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

		none

	Returns:

		nothing - *
*/
function pageExplore(logstatus,data) {
	var main = document.getElementById('content');

	/* create and append menu based on log status */
	var menu;
	if(logstatus === true) {
		menu = barMenu();
	} else {
		menu = barLog();
	}
	main.appendChild(menu);

	/* create filter menu */
	var filter = barFilter();
	main.appendChild(filter);

	/* create box template */
	var box = boxCreate();

	/* loop through links & insert data into boxes */
	var index = 0;
	while(index < 10) {
		var newBox = box.cloneNode(true);
		newBox.setAttribute('id',index);

		newBox.querySelector(".box-title").innerHTML = "<a href=''>Metric Modulation In Early 90's Heavy Metal</a>";
		newBox.querySelector(".box-author").innerHTML = "<a href=''>author</a>";
		var percentage = 65;
		newBox.querySelector(".rating-bar").className += " w" + (percentage - (percentage % 10));
		newBox.querySelector(".rating-bar").style = "width:" + percentage + "%";
		newBox.querySelector(".star").checked = false;
		newBox.querySelector(".box-image").innerHTML = "Image";
		newBox.querySelector(".box-blurb").innerHTML = "Here is some blurb information to convince you to click on my awesome resource. You should totally check it out. It's the coolest!";
		newBox.querySelector(".box-created").innerHTML = "created: 00/00/00";
		newBox.querySelector(".box-edited").innerHTML = "edited: 00/00/00";
		newBox.querySelector(".box-ranks").innerHTML = "ranks: #########";
		newBox.querySelector(".box-views").innerHTML = "views: #########";
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

	var menu = barMenu();

	/* append the form to the main div */
	var main = document.getElementById('content');
	main.appendChild(menu);

	/* create bookmarks dash */
	var bookmarks = dashBookmarks();
	main.appendChild(bookmarks);

	/* fetch user pages */
	var promiseBP = getPages();

	/* fetch user learning guides */
	var promiseLG = getLearningGuides();

	Promise.all([promiseBP,promiseLG]).then(function(values) {
		/* block page create form */
		var row_PageCreate = formGenerateUserContent('blockpage',values[0]);
		main.appendChild(row_PageCreate);

		/* learning guide create form */
		var row_LgCreate = formGenerateUserContent('lg',values[1]);
		main.appendChild(row_LgCreate);
	},function(error) {
		console.log(error);
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
	var search = barSearch();
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

	/// if profiledata == "err" handle this
	/// if profiledata == "noprofileloggedout" handle this
	if(profiledata === "err") {
		console.log("profile error");
	} else if (profiledata === "noprofileloggedout") {
		console.log("profile logged out");
	}

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
	var row_Autosave = rowProfileSingle("autosave","Auto Save:",profileinfo.autosave);
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
	main.appendChild(document.createElement('hr')); /// REMOVE THIS AFTER STYLING
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
				if(xmlhttp.responseText === "loggedin") {
					window.location = createURL("/home");
				} else if(xmlhttp.responseText === "incorrect") {
					alertify.alert("The Passowrd Was Incorrect");
				} else if(xmlhttp.responseText === "notfound") {
					alertify.alert("The Username Could Not Be Found");
				} else {
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
	var phone = document.getElementsByName('phone-signup')[0].value;
	var password = document.getElementsByName('password-signup')[0].value;
	var passwordcheck = document.getElementsByName('password-signup-check')[0].value;

	/// todo: instant validation needed
	if(password !== passwordcheck) {
		/// oh fuck
	}

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "username=" + username + "&email=" + email + "&phone=" + phone + "&password=" + password;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					window.location = createURL("/home");
				} else if(xmlhttp.responseText === "exists") {
					alertify.alert("That Username Already Exists.\nPlease Choose A Different One.");
				} else {
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
	Function: createlg

	This function creates a user learning guide.

	Parameters:

		none

	Returns:

		nothing - *
*/
function createlg() {

	/* create the url destination for the ajax request */
	var url = createURL("/createlg");

	/* get the page name */
	var guidename = document.getElementsByName('lgname-create')[0].value;

	if(guidename === "") {
		alertify.alert("Please Enter A Guide Name.");
	} else {
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		var params = "guidename=" + guidename;

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "pageexists") {
						alertify.alert("You Already Have A Guide With That Name.");
					} else if (xmlhttp.responseText === "nocreateloggedout") {
						alertify.alert("Unable To Create Page. You Are Logged Out.");
					} else if (xmlhttp.responseText === "err") {
						alertify.alert("An Error Occured. Please Try Again Later.");
					} else {
						window.location = createURL("/editlg?lg=" + xmlhttp.responseText);
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
	Function: createpage

	This function creates a user page.

	Parameters:

		none

	Returns:

		nothing - *
*/
function createpage() {

	/* create the url destination for the ajax request */
	var url = createURL("/createpage");

	/* get the page name */
	var pagename = document.getElementsByName('pagename-create')[0].value;

	if(pagename === "") {
		alertify.alert("Please Enter A Page Name.");
	} else {
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();

		var params = "pagename=" + pagename;

		xmlhttp.open("POST",url,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					if(xmlhttp.responseText === "pageexists") {
						alertify.alert("You Already Have A Page With That Name.");
					} else if (xmlhttp.responseText === "nocreateloggedout") {
						alertify.alert("Unable To Create Page. You Are Logged Out.");
					} else if (xmlhttp.responseText === "err") {
						alertify.alert("An Error Occured. Please Try Again Later.");
					} else {
						window.location = createURL("/editpage?page=" + xmlhttp.responseText);
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
	Function: deleteLG

	This function deletes the selected user learning guide.

	Parameters:

		gid - guide id

	Returns:

		none - *
*/
function deleteLG(gid) {
	/* create the url destination for the ajax request */
	var url = createURL("/deletelg");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "gid=" + gid;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					var selectBox = document.getElementById('lg-select');
					var count = selectBox.length;
					var optionToRemove;
					for(var i = 0; i < count; i++) {
						if(selectBox.options[i].value === gid) {
							optionToRemove = selectBox.options[i];
						}
					}
					selectBox.removeChild(optionToRemove);
				} else if(xmlhttp.responseText === "nodeleteloggedout") {
					alertify.alert("Could Not Delete Guide. You Are Logged Out.");
				} else {
					alertify.alert("There Was A Problem Deleting The Guide.");
				}
			} else {
				alertify.alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
		}
	};

	xmlhttp.send(params);
}

/*
	Function: deletePage

	This function deletes the selected user block page.

	Parameters:

		pid - page id

	Returns:

		none - *
*/
function deletePage(pid) {
	/* create the url destination for the ajax request */
	var url = createURL("/deletepage");

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "pid=" + pid;

	xmlhttp.open("POST",url,true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if(xmlhttp.status === 200) {
				if(xmlhttp.responseText === "success") {
					var selectBox = document.getElementById('page-select');
					var count = selectBox.length;
					var optionToRemove;
					for(var i = 0; i < count; i++) {
						if(selectBox.options[i].value === pid) {
							optionToRemove = selectBox.options[i];
						}
					}
					selectBox.removeChild(optionToRemove);
				} else if(xmlhttp.responseText === "nodeleteloggedout") {
					alertify.alert("Could Not Delete Page. You Are Logged Out.");
				} else {
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
	Function: getLearningGuides

	This function fetches a user's learning guides. It returns a promise containing learning guide data in the following format (lid,lgname,)

	Parameters:

		none

	Returns:

		success - promise, pagedata
*/
function getLearningGuides() {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getlgs");

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
	Function: getPages

	This function fetches a user's pages. It returns a promise containing page data in the following format (pid,pagename,)

	Parameters:

		none

	Returns:

		success - promise, pagedata
*/
function getPages() {
	var promise = new Promise(function(resolve,reject) {

		/* create the url destination for the ajax request */
		var url = createURL("/getpages");

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
				if(xmlhttp.responseText === "profilesaved") {
						btn.style = "background-color: #00ffe1";
						alertify.log("Saved!","success");
					} else if (xmlhttp.responseText === "nosaveloggedout") {
						btn.style = "background-color: #e83e3e";
						alertify.alert("You Can't Save Because You Are Logged Out. Log In On A Separate Page, Then Return Here & Try Again.");
					} else {
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
