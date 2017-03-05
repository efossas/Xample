/* eslint-env browser, es6 */
/******
	Title: Play Page
	This is the front-end for playing with Xample's Bengine
******/

/*
	global Bengine:true
	global MathJax:true
	global PDFJS:true
	global hljs:true
	global alertify:true
*/

var blockExtensibles = {};
var blockGlobals = {};
var blockCustomFunctions = {};
var blockOptions = {
    enableSave:false
};

blockExtensibles.tarea = new function image() {
    /*
        type (string) - should match property name you add to extensibles, must be 5 letters
        name (string) - the name that appears to the user to create your block
        upload (boolean) - whether this block requires uploading media
    */
	this.type = "tarea";
	this.name = "textarea";
	this.upload = false;

    /*
        creates your block in editing mode. attach your custom block to the block element and return the block

        block - attach your custom block to this element
        content - any content from the database
    */
	this.insertContent = function(block,content) {
		var xtarea = document.createElement("textarea"); // create textarea
		xtarea.setAttribute("class","xTar"); // set class for styling
		xtarea.value = content; // attach any content to the textarea

		block.appendChild(xtarea); // append the textarea to the block

		return block; // return the block
	};

    /*
        any code to run after the block has been attached to the dom

        bid - the block id, so you can getElementById
        data - this is always null, it might become something in later versions
    */
	this.afterDOMinsert = function(bid,data) {
		// this simple example requires no code after appending block to dom
	};

    /*
        grab only the necessary values to save to the database and return them

        bid - the block id, so you can getElementById
    */
	this.saveContent = function(bid) {
		var textstr = document.getElementById('bengine-a' + bid).children[0].value; // get the text from the textarea
		return textstr; // return the value
	};

    /*
        creates your block in show mode. attach your custom block to the block element and return the block

        block - attach your custom block to this element
        content - any content from the database
    */
	this.showContent = function(block,content) {
		var xtarea = document.createElement("textarea"); // create textarea
		xtarea.setAttribute("class","xTar-show"); // set class for styling
		xtarea.src = content; // attach any content
        xtarea.setAttribute('readonly','true'); // since this is show mode, remove editing capabilities

		block.appendChild(xtarea); // append to block

		return block; // return the block
	};

    /*
        add your custom css here

        should contain two classes, one for edit mode & one for show mode
    */
    this.styleBlock = function() {
        var stylestr = `
        .tarea {
        	max-width: 720px;
        	margin: 0px auto 0 auto;
        }

        .xTar, .xTar-show {
        	display: inline-block;
        	overflow-y: auto;

        	width: 720px;
        	height: 200px;
        	border: 1px solid black;
        	border-radius: 2px;
        	background-color: white;

        	padding: 0px;
        	margin: 0px;
        	box-sizing: border-box;

        	font-family: Arial, Helvetica, sans-serif;
        	font-size: 1em;
        	font-weight: 300;
        	color: black;

            resize: none;
        }

        .xTar-show {
        	padding: 8px;
        	margin-bottom: 12px;
        }
        `;

        return stylestr;
    };

    /*
        use this to attach functions you need during runtime. you can use them by calling this.f.myfunction in other parts of this extensible. you may have to use javascript's .bind() function when calling it.
    */
    this.f = {
        // our simple example requires no runtime functions
    };
};

function pagePlay() {

    var main = document.getElementById('content');

    var playEngine = new Bengine(blockExtensibles,blockGlobals,blockCustomFunctions,blockOptions);

    playEngine.blockEngineStart('content',['page',1,1],[]);
}
