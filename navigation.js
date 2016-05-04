/*
	Title: blocks
	About: This file creates, saves, and deletes blocks on a page. The page never reloads, it uses ajax requests to make updates. There are functions for handling block generation on page load.
	
	Important Terms:
	  Block ID - Blocks are just <div> tags with the attribute id=""
	  Block Type - Blocks are given the attribute class="". This is also used to insert the correct html into the block <div>
	  Block Content - The actual content of the block (not the html). This could be text, image link, etc.
	  Block Count - The number of blocks currently on the page. Used a lot for inserting or changing block id's.
	  Page Table - Pages are stored in the database as p_aid_pid, where aid = author id & pid = page id. Thus, aid & pid are used a lot for finding the correct page table to store the block data in.
*/

/*
	Section: Helper Functions
	About: These are functions to help provide information about the current page.
*/

/*
   Function: insert

   Find a div with the correct class name and insert some content

   Parameters:

      divId - The div class to find
      divContent - The content to insert

   Returns:

      Nothing.
*/
function insert(divId,divContent) { // not used
	document.getElementById(divId).innerHTML = divContent;
}

function emptyDiv(divId) {
	
	var node = document.getElementById(divId);
	
	while (node.hasChildNodes()) {
    	node.removeChild(node.lastChild);
	}
}

function loginForm() {
	var login = document.createElement('div');
	login.setAttribute('class', 'form');
	login.setAttribute('id', 'form-login');
	
	var username = document.createElement('input');
	username.setAttribute('type', 'text');
	username.setAttribute('name', 'username-login');
	username.setAttribute('maxlength', '50');
	username.setAttribute('placeholder', 'User Name');

	var password = document.createElement('input');
	password.setAttribute('type', 'password');
	password.setAttribute('name', 'password-login');
	password.setAttribute('maxlength', '32');
	password.setAttribute('placeholder', 'Password');
	
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('name', 'submit-login');
	submit.setAttribute('onclick', 'login();');
	submit.innerHTML = "Log In";
	
	login.appendChild(username);
	login.appendChild(password);
	login.appendChild(submit);
	
	return login;
}

function signupForm() {
	var signup = document.createElement('div');
	signup.setAttribute('class', 'form');
	signup.setAttribute('id', 'form-signup');
	
	var username = document.createElement('input');
	username.setAttribute('type', 'text');
	username.setAttribute('name', 'username-signup');
	username.setAttribute('maxlength', '50');
	username.setAttribute('placeholder', 'User Name');
	
	var email = document.createElement('input');
	email.setAttribute('type', 'text');
	email.setAttribute('name', 'email-signup');
	email.setAttribute('maxlength', '50');
	email.setAttribute('placeholder', 'Email - optional');
	
	var phone = document.createElement('input');
	phone.setAttribute('type', 'text');
	phone.setAttribute('name', 'phone-signup');
	phone.setAttribute('maxlength', '15');
	phone.setAttribute('placeholder', 'Phone - optional');
	
	var password = document.createElement('input');
	password.setAttribute('type', 'password');
	password.setAttribute('name', 'password-signup');
	password.setAttribute('maxlength', '32');
	password.setAttribute('placeholder', 'Password');
	
	var passwordc = document.createElement('input');
	passwordc.setAttribute('type', 'password');
	passwordc.setAttribute('name', 'password-signup-check');
	passwordc.setAttribute('maxlength', '32');
	passwordc.setAttribute('placeholder', 'Repeat Password');
	
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('value', 'submit-signup');
	submit.setAttribute('onclick', 'signup();');
	submit.innerHTML = "Sign Up";
	
	var error = document.createElement('div');
	error.setAttribute('class', 'error');
	error.setAttribute('id', 'error-signup');
	
	signup.appendChild(username);
	signup.appendChild(email);
	signup.appendChild(phone);
	signup.appendChild(password);
	signup.appendChild(passwordc);
	signup.appendChild(submit);
	signup.appendChild(error);
	
	return signup;
}

function displaySignUp() {
	var signup = signupForm();
	
	var main = document.getElementById('content');
	main.appendChild(signup);
	main.removeChild(document.getElementById('signupbtn'));
}

function logoutBtn() {
	var logout = document.createElement('button');
	logout.setAttribute('type', 'button');
	logout.setAttribute('value', 'submit-logout');
	logout.setAttribute('onclick', 'logout();');
	logout.innerHTML = "Log Out";
	
	return logout;
}

function displayLanding() {
	var login = loginForm();
	
	var signupbtn = document.createElement('button');
	signupbtn.setAttribute('type', 'button');
	signupbtn.setAttribute('id', 'signupbtn');
	signupbtn.setAttribute('onclick', 'displaySignUp();');
	signupbtn.innerHTML = "Sign Up";
	
	var main = document.getElementById('content');
	main.appendChild(login);
	main.appendChild(document.createElement('hr')); // remove this later, when you style
	main.appendChild(signupbtn);
}

function displayHome() {
	
	var logout = logoutBtn();
	
	var header = document.createElement('div');
	header.setAttribute('class', 'form');
	header.setAttribute('id', 'form-header');
	
	var title = document.createElement('input');
	title.setAttribute('type', 'text');
	title.setAttribute('name', 'pagename-create');
	title.setAttribute('maxlength', '50');
	title.setAttribute('placeholder', 'Page Name');
	
	var submit = document.createElement('button');
	submit.setAttribute('type', 'button');
	submit.setAttribute('value', 'submit-createpage');
	submit.setAttribute('onclick', 'createpage();');
	submit.innerHTML = "Create Page";
	
	header.appendChild(logout);
	header.appendChild(title);
	header.appendChild(submit);
	
	var main = document.getElementById('content');
	main.appendChild(logout);
	main.appendChild(header);
	
	var promise = getPages();
	
	promise.then(function(pages) {
		var pagearray = pages.split(',');
		
		var pagesdiv = document.createElement('div');
		pagesdiv.setAttribute('class', 'pagelist');
		
		if(pagearray.length === 1) {
			count = 0;
		} else {
			var count = pagearray.length / 2;
		}
		var i = 0;
		
		while(count > 0)
		{
			var link = document.createElement('a');
			link.setAttribute('class', 'pagelink');
			link.setAttribute('href', 'xample/editpage?page=' + pagearray[i]);
			link.setAttribute('target', '_blank');
			link.innerHTML = pagearray[i+1];
			pagesdiv.appendChild(link);
			
			i += 2;
			count--;
		}
		
		main.appendChild(document.createElement('hr')); // remove this later, when you style
		main.appendChild(pagesdiv);
		
	}, function(error) {
		console.log("getPages promise error");
	});
}

/*
	Section: Block Functions
	About: These are functions handle the block generator
*/

function countBlocks() {

	var num = 0;
	var miss = true;
	while (miss == true)
	{
		num++;
		miss = !!document.getElementById(num);
	}

	return --num;
}

function generateBlock(bid,btype) {
	var block = document.createElement('div');
	block.setAttribute('class',btype);
	block.setAttribute('id','a' + bid);
	
	return block;
}

function insertContent(block, btype, content) {
	if(btype == "xtext")
	{
		var str = '<iframe class="xTex" maxlength="1023">' + content + '</iframe>';
		block.innerHTML = str;

		/* iframe has to be put with document first or some bullshit, so wait one second for that to happen and then insert content */
		setTimeout(function() {	
			var iframe = block.childNodes[0].contentDocument; 
			iframe.open(); 
			iframe.write(content); 
			iframe.close(); 
			
			block = block.childNodes[0];
			
			/* attach keyboard shortcuts to iframe */
			if (iframe.addEventListener) {
			    iframe.addEventListener("keydown", detectKey.bind(null,block), false);
			} else if (iframe.attachEvent) {
			    iframe.attachEvent("onkeydown", detectKey.bind(null,block));
			} else {
			    iframe.onkeydown = detectKey.bind(null,block);
			}
			
		}, 1);
	}
	if(btype == "xcode")
	{
		var str = '<code class="xCde" onblur="renderCode(this);" contenteditable>' + content + '</code>';
		block.innerHTML = str;
	}
	if(btype == "xmath")
	{
		var preview = '<div class="mathImage"></div>';
		var str = '<div class="xMat" onblur="renderMath(this);" contenteditable>' + content + '</code>';
		block.innerHTML = preview + str;
	}
	if(btype == "latex")
	{
		var preview = '<div class="latexImage"></div>';
		var str = '<div class="xLtx" onblur="renderLatex(this);" contenteditable>' + content + '</code>';
		block.innerHTML = preview + str;
	}
	if(btype == "image")
	{
		var str = '<img class="xImg" src="' + content + '">';
		block.innerHTML = str;
	}
	if(btype == "audio")
	{
		var str = '<audio class="xAud" controls><source src="' + content + '" type="audio/mpeg"></audio>';
		block.innerHTML = str;
	}
	if(btype == "video")
	{
		var str = '<video class="xVid" controls><source src="' + content + '" type="video/mp4"></video>';
		block.innerHTML = str;
	}
	
	return block;
}

/*
*	some useful notes:
*   iframe.contentWindow.document = iframe.contentDocument
*	edits happen in 'body', so .getElementsByTagName('body')[0]
*/
function detectKey(iframe,event) {
    
    /* b : bold */
    if(event.shiftKey && event.ctrlKey && event.keyCode == 66)
	{
		iframe.contentDocument.execCommand('bold',false,null);
	}
	/* i : italics */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 73)
	{
		iframe.contentDocument.execCommand('italic',false,null);
	}
	/* l : list */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 76)
	{
		iframe.contentDocument.execCommand('insertUnorderedList',false,null);
	}
	/* + : superscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 187)
	{
		iframe.contentDocument.execCommand('superscript',false,null);
	}
	/* - : subscript */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 189)
	{
		iframe.contentDocument.execCommand('subscript',false,null);
	}
	/* j : justify left */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 74)
	{
		iframe.contentDocument.execCommand('justifyLeft',false,null);
	}
	/* f : justify full */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 70)
	{
		iframe.contentDocument.execCommand('justifyFull',false,null);
	}
	/* h - hyperlink */
	if(event.shiftKey && event.ctrlKey && event.keyCode == 72)
	{
		link = prompt('Enter the link: ', 'http://');
		if (link.indexOf("http://") < 0 && link.indexOf("https://") < 0) {
	        link = "http://" + link;
	    }
		iframe.contentDocument.execCommand('createLink',false,link);
	}
		
	// is this necessary ??    
    event.stopPropagation();	
}

function renderCode(block) {
	
	/* add code formatting */
	hljs.highlightBlock(block);
	
	// alert the user if they have surpassed our limit
	if(block.textContent.length > 1024)
	{
		alert("There is too much in this code block. The block will not save correctly. Please remove some of its content.");
	}
}

function renderMath(block) {
	
	/* get the math notation and prepend/append backticks */
	var str = "`" + block.textContent + "`";
	
	/* put the asciimath into the image preview block */
	var imageBlock = block.parentNode.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

function renderLatex(block) {
	
	/* get the math notation and prepend/append double dollars */
	var str = "$$" + block.textContent + "$$";
	
	/* put the latex into the image preview block */
	var imageBlock = block.parentNode.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

function insertMath(block) {
	/* get the math notation and prepend/append backticks */
	var str = "`" + block.childNodes[1].textContent + "`";
	
	/* put the asciimath into the image preview block */
	var imageBlock = block.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

function insertLatex(block) {
	/* get the math notation and prepend/append double dollars */
	var str = "$$" + block.childNodes[1].textContent + "$$";
	
	/* put the latex into the image preview block */
	var imageBlock = block.childNodes[0];
	imageBlock.innerHTML = str;
	
	/* render the image */
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
}

function blockButtons(bid) {
	
	var buttonDiv = document.createElement('div');
	buttonDiv.setAttribute('class', 'blockbtns');
	buttonDiv.setAttribute('id', 'b' + bid);
	
	var txtBtn = document.createElement('button');
	txtBtn.setAttribute("onclick", "addBlock(" + bid + ",'xtext')");
	txtBtn.innerHTML = "text";
	
	var cdeBtn = document.createElement('button');
	cdeBtn.setAttribute("onclick", "addBlock(" + bid + ",'xcode')");
	cdeBtn.innerHTML = "code";
	
	var matBtn = document.createElement('button');
	matBtn.setAttribute("onclick", "addBlock(" + bid + ",'xmath')");
	matBtn.innerHTML = "math";
	
	var ltxBtn = document.createElement('button');
	ltxBtn.setAttribute("onclick", "addBlock(" + bid + ",'latex')");
	ltxBtn.innerHTML = "latex";
	
	var imgBtn = document.createElement('button');
	imgBtn.setAttribute("onclick", "addBlock(" + bid + ",'image')");
	imgBtn.innerHTML = "image";
	
	var audBtn = document.createElement('button');
	audBtn.setAttribute("onclick", "addBlock(" + bid + ",'audio')");
	audBtn.innerHTML = "audio";
	
	var vidBtn = document.createElement('button');
	vidBtn.setAttribute("onclick", "addBlock(" + bid + ",'video')");
	vidBtn.innerHTML = "video";
	
	var delBtn = document.createElement('button');
	delBtn.setAttribute('id', 'd' + bid);
	delBtn.setAttribute('onclick', 'deleteBlock(' + bid + ')');
	delBtn.style.visibility='hidden';
	delBtn.innerHTML = "delete &darr;";
	
	buttonDiv.appendChild(txtBtn);
	buttonDiv.appendChild(cdeBtn);
	buttonDiv.appendChild(matBtn);
	buttonDiv.appendChild(ltxBtn);
	buttonDiv.appendChild(imgBtn);
	buttonDiv.appendChild(audBtn);
	buttonDiv.appendChild(vidBtn);
	buttonDiv.appendChild(delBtn);
	
	return buttonDiv;
}

function makeSpace(bid, count) {
	while(bid < count)
	{
		var next = count + 1;
		
		var buttons = blockButtons(next);
		document.getElementById('b' + count).parentNode.replaceChild(buttons,document.getElementById('b' + count));
		
		document.getElementById('a' + count).setAttribute('id', 'a' + next);
		
		document.getElementById(count).setAttribute('id', next);
		
		count--;
	}
}

function insertBlock(block,buttons,bid,count) {
		
	var blocksdiv = document.getElementById('blocks');
	
	var group = document.createElement('div');
	group.setAttribute('class', 'block');
	group.setAttribute('id', bid);
	
	group.appendChild(block);
	group.appendChild(buttons);
	
	if(bid <= count) {
		var position = document.getElementById('blocks').children[bid];
		document.getElementById('blocks').insertBefore(group, position);
	} else {
		blocksdiv.appendChild(group);
	}
}

function uploadMedia(bid,btype) {
	var fileSelect = document.getElementById('file-select');
	
	fileSelect.click();
	fileSelect.onchange = function()  {
		
		createBlock(bid - 1,btype);
	
		var promise = new Promise(function(resolve, reject) {
			var file = fileSelect.files[0];
			
			// place some checks here
			// file.type.match('image.*')
			
			var formData = new FormData();
			formData.append('media', file, file.name);
			
			var pid = document.getElementsByName('pageid')[0].value;
			
			var url = window.location.href;
			var splitUrl = url.split("/");
			
			url = splitUrl[0] + "//" + splitUrl[2] + "/xample/uploadmedia?" + "pid=" + pid + "&btype=" + btype;
			
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open('POST', url, true);
			
			xmlhttp.onreadystatechange = function() {
		        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
					if(xmlhttp.status == 200){
			        	resolve(xmlhttp.response);
					}
					else {
						alert('Error:' + xmlhttp.status + ": Please Try Again");
					}
		        }
		    }
			    
			xmlhttp.send(formData);
		});
		
		promise.then(function(success) { 
			
			if (success == "err") {
				deleteBlock(bid - 1);
				alert('The Was A Problem Uploading The Media: Please Try Again');
			} else {
				/* audio & video divs have their src set in an extra child node */
				if (btype == "image") {
					var tag = document.getElementById('a' + bid).childNodes[0];
					tag.src = success;
				}
				else if(btype == "audio" || btype == "video") {
					var tag = document.getElementById('a' + bid).childNodes[0].childNodes[0];
					tag.src = success;
					tag.parentNode.load(); 
				}
			}
			
			
		}, function(error) {
				/* error is data passed thorugh reject */
		});
	}		
}

function createBlock(bid,btype) {

	var blockCount = countBlocks();
	
	/* make space if inserting block, if appending block, ignore */
	if(bid < blockCount)
	{ makeSpace(bid, blockCount); }
	
	/* create and insert block */
	bid++;
	
	var content = "";
	
	var block = generateBlock(bid,btype);
	block = insertContent(block, btype, content);
	var blockbuttons = blockButtons(bid);
	insertBlock(block,blockbuttons,bid,blockCount);
	
	/* make delete buttons visible */
	var i = 0;
	while(i <= blockCount)
	{
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
}

function addBlock(bid,btype) {
	
	if(btype == "xtext")
	{
		createBlock(bid,btype);
		
		/* grab the block iframe that was just made */
		var block = document.getElementById("a" + (bid + 1)).childNodes[0];
		var blockDoc = block.contentDocument;
		
		/* make iframe editable */
		blockDoc.designMode = "on";
	}
	
	if (["xcode","xmath","latex"].indexOf(btype) > -1)
	{
		createBlock(bid,btype);
	}
	
	/* upload media file if necessary */
	if (["image","audio","video"].indexOf(btype) > -1)
	{
		uploadMedia(bid + 1,btype);
	}
}

function closeSpace(bid,count) {
	while(bid < count)
	{
		var next = bid + 1;
		
		var buttons = blockButtons(bid);
		document.getElementById('b' + next).parentNode.replaceChild(buttons,document.getElementById('b' + next));
		
		document.getElementById('a' + next).setAttribute('id', 'a' + bid);
		
		document.getElementById(next).setAttribute('id', bid);
		
		bid++;
	}
}

function removeBlock(bid) {
	var element = document.getElementById(bid);
	element.parentNode.removeChild(element);
}

function deleteBlock(bid) {
	var blockCount = countBlocks();
	
	bid++;
	
	/* delete the block */
	removeBlock(bid);
	
	/* close space if removing block from middle, otherwise ignore */
	if(bid < blockCount)
	{ closeSpace(bid, blockCount); }
	
	/* make delete buttons visible & last button invisible */
	var i = 0;
	blockCount = countBlocks();
	while(i < blockCount)
	{
		document.getElementById('d' + i).style.visibility = 'visible';
		i++;
	}
	document.getElementById('d' + i).style.visibility = 'hidden';
}

function editPage(pagedata) {
	
	/* log out button */
	var logout = logoutBtn();
	
	/* block array -> pid,pagename,mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray = pagedata.split(',');
	
	/* hidden pid & title */
	pid = blockarray[0];
	pagename = blockarray[1];
	
	var pageid = document.createElement('input');
	pageid.setAttribute('type', 'hidden');
	pageid.setAttribute('name', 'pageid');
	pageid.setAttribute('value', pid);
	
	var title = document.createElement('input');
	title.setAttribute('type', 'text');
	title.setAttribute('name', 'pagename');
	title.setAttribute('maxlength', '50');
	title.setAttribute('value', pagename);
	
	/* save btns */
	var savebtn = document.createElement('button');
	savebtn.setAttribute('type', 'button');
	savebtn.setAttribute('name', 'save-blocks');
	savebtn.setAttribute('onclick', 'saveBlocks()');
	savebtn.innerHTML = "save";
		
	/* blocks */
	var blocksdiv = document.createElement('div');
	blocksdiv.setAttribute('class', 'blocks');
	blocksdiv.setAttribute('id', 'blocks');
	
	/* initial first block buttons */
	var buttons = blockButtons(0);
	blocksdiv.appendChild(buttons);
	
	var count = 2;
	var i = 1;
	
	while(count < blockarray.length)
	{
		/* create the block */
		var block = generateBlock(i,blockarray[count]);
		block = insertContent(block,blockarray[count],blockarray[count+1]);
		
		/* create the block buttons */
		var buttons = blockButtons(i);
		
		/* create block + button div */
		var group = document.createElement('div');
		group.setAttribute('class', 'block');
		group.setAttribute('id', i);
		
		group.appendChild(block);
		group.appendChild(buttons);

		/* append group to blocks div */
		blocksdiv.appendChild(group);
		
		count += 2;
		i++;
	}
	
	/* hidden form for media uploads */
	var fileinput = document.createElement('input');
	fileinput.setAttribute('type', 'file');
	fileinput.setAttribute('id', 'file-select');
	
	var filebtn = document.createElement('button');
	filebtn.setAttribute('type', 'submit');
	filebtn.setAttribute('id', 'upload-button');
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/uploadmedia";
	
	var fileform = document.createElement('form');
	fileform.setAttribute('id', 'file-form');
	fileform.setAttribute('action', url);
	fileform.setAttribute('method', 'POST');
	fileform.style.visibility = 'hidden';
	
	fileform.appendChild(fileinput);
	fileform.appendChild(filebtn);

	var main = document.getElementById('content');
	main.appendChild(logout);
	main.appendChild(pageid);
	main.appendChild(title);
	main.appendChild(savebtn);
	main.appendChild(blocksdiv);
	main.appendChild(fileform);
	
	/* make delete buttons visible & last button invisible */
	var i = 0;
	blockCount = countBlocks();
	while(i < blockCount)
	{
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
}

/*
	Section: AJAX Functions
	About: These functions send ajax requests
*/
function login() {
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/login";
	
	var username = document.getElementsByName('username-login')[0].value;
	var password = document.getElementsByName('password-login')[0].value;
	
	// instant validation needed
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "username=" + username + "&password=" + password;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "loggedin") {
		        	emptyDiv('content');
		        	displayHome();
	        	}
	        	else if(xmlhttp.responseText == "incorrect") {
		        	alert("The Passowrd Was Incorrect");
	        	} else if(xmlhttp.responseText == "notfound") {
		        	alert("The Username Could Not Be Found");
		        } else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}

function signup() {
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/signup";
	
	var username = document.getElementsByName('username-signup')[0].value;
	var email = document.getElementsByName('email-signup')[0].value;
	var phone = document.getElementsByName('phone-signup')[0].value;
	var password = document.getElementsByName('password-signup')[0].value;
	var password = document.getElementsByName('password-signup-check')[0].value;
	
	// instant validation needed
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "username=" + username + "&email=" + email + "&phone=" + phone + "&password=" + password;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "success") {
		        	emptyDiv('content');
		        	displayHome();
	        	}
	        	else if(xmlhttp.responseText == "exists") {
		        	alert("That Username Already Exists.\nPlease Choose A Different One.");
	        	} else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}

function logout() {
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/logout";
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "loggedout") {
		        	emptyDiv('content');
		        	displayLanding();
	        	} else {
		        	alert("An Unknown Error Occurred");
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send();
}

function createpage() {
	
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/createpage";
	
	var pagename = document.getElementsByName('pagename-create')[0].value;
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	var params = "pagename=" + pagename;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "pageexists") {
		        	alert("You Already Have A Page With That Name.");
	        	} else if (xmlhttp.responseText == "pageexists") {
		        	alert("An Error Occured. Please Try Again Later");
		        } else {
		        	emptyDiv('content');
		        	editPage(xmlhttp.responseText + "," + pagename);
	        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}

function getPages() {
	
	var promise = new Promise(function(resolve, reject) {
	
		var url = window.location.href;
		var splitUrl = url.split("/");
	
		url = splitUrl[0] + "//" + splitUrl[2] + "/xample/getpages";
		
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("POST", url, true);
		
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		xmlhttp.onreadystatechange = function() {
	        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
				if(xmlhttp.status == 200) {
		        	if(xmlhttp.responseText == "err") {
			        	alert("An Unknown Error Occurred");
		        	} else {
			        	resolve(xmlhttp.responseText);
		        	}
				}
				else {
					alert("Error:" + xmlhttp.status + ": Please Try Again Later");
				}
	        }
	    }
		    
		xmlhttp.send();
	});
	
	return promise;
}

function saveBlocks() {
	
	var blockType = [];
	var blockContent = [];
	
	var blockCount = countBlocks();
	var bid = 1;
	
	//
	// need solution for escaping: ' , & in the xtext,xcode,latex,xmath blocks
	// ' breaks strings , breaks arrays & breaks ajax params
	//
	
	/* get the block types & contents */
	if(blockCount > 0)
	{
		var i = 0;
		while(blockCount >= bid)
		{
			var btype = document.getElementById('a' + bid).className;
			blockType[i] = btype;
			
			/* figure out block type & grab block content */
			if (btype == "xtext") {
				blockContent[i] = document.getElementById('a' + bid).children[0].contentDocument.getElementsByTagName('body')[0].innerHTML;
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			} else if (btype == "xcode") {
				blockContent[i] = document.getElementById('a' + bid).children[0].textContent;
				
				// this needs to grab innerHTML instead and will need to be passed through a parse
				// needs to ignore all span classes: "<span" to next ">" and "</span>"
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			}
			else if (btype == "latex" || btype == "xmath") {
				/* replace() is for escaping backslashes */
				blockContent[i] = document.getElementById('a' + bid).children[1].innerHTML.replace(/\\/g, "\\\\");
				
				// NEED SOLUTION
				blockContent[i] = blockContent[i].replace(/'/g, " ").replace(/,/g, " ").replace(/&/g, " ");
			}
			else if (btype == "image") {
				var str = document.getElementById('a' + bid).children[0].src;
				blockContent[i] = str.replace(location.href.substring(0, location.href.lastIndexOf('/')+1), "");
				
			}
			else if (btype == "audio" || btype == "video") {
				var str = document.getElementById('a' + bid).children[0].children[0].src;
				blockContent[i] = str.replace(location.href.substring(0, location.href.lastIndexOf('/')+1), "");
			}
			
			i++;
			bid++;
		}
		
		/* merge mediaType & mediaContent arrays into default comma-separated strings */
		var types = blockType.join();
		var contents = blockContent.join();	
	}
		
	/* send the block data as ajax request */
	var url = window.location.href;
	var splitUrl = url.split("/");
	
	url = splitUrl[0] + "//" + splitUrl[2] + "/xample/saveblocks";
	
	/* get pagename & pageid */
	var pid = document.getElementsByName('pageid')[0].value;
	var pagename = document.getElementsByName('pagename')[0].value;
	
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();

	var params = "mediaType=" + types + "&mediaContent=" + contents + "&pid=" + pid + "&pagename=" + pagename;
	
	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if(xmlhttp.status == 200) {
	        	if(xmlhttp.responseText == "blockssaved") {
			        	// change status div to saved
			        	console.log("saved!");
		        	} else {
			        	alert("An Unknown Error Occurred");
		        	}
			}
			else {
				alert("Error:" + xmlhttp.status + ": Please Try Again Later");
			}
        }
    }
	    
	xmlhttp.send(params);
}
