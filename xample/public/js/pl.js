/* eslint-env browser, es6 */
/******
	Title: Play Page
	This is the front-end for playing with Xample's Bengine
******/

/* from omni.js */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
	global barPageSettings:true
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
	global globalScope:true
	global journalError:true
	global setBookmark:true
	global setView:true
	global watermark:true
*/
/*
	global Bengine:true
	global alertify:true
    global CodeMirror:true
*/

var blockExtensibles = {};
var blockCustomFunctions = {};
var blockOptions = {
    enableSave:false
};

function pagePlay() {

    var main = document.getElementById('content');

    var tutorial = document.createElement('div');
    tutorial.setAttribute('class','wrapper');

    var explanation = document.createElement('div');
    tutorial.appendChild(explanation);

    explanation.innerHTML = `<br><p>This is a playground for testing custom blocks on Bengine. Bengine is the block engine that runs on WisePool. To create a custom block, you need to create a function with certain properties and methods. You'll find a simple example of how a "textarea" block is created below:</p>`;

    var playBlock = document.createElement('div');
    tutorial.appendChild(playBlock);

    document.getElementsByTagName('body')[0].insertBefore(tutorial,main);

    var playBlockStartCode = `function() {

/**************************************
type (string) - should match property name you add to extensibles, must be 5 letters
name (string) - the name that appears to the user to create your block
upload (boolean) - whether this block requires uploading media
***************************************/

this.type = "tarea";
this.name = "textarea";
this.upload = false;

/**************************************
insertContent(block,content)
creates your block in editing mode. attach your custom block to the block element and return the block

block - attach your custom block to this element
content - any content from the database
***************************************/

this.insertContent = function(block,content) {
	var xtarea = document.createElement("textarea");
	xtarea.setAttribute("class","xTar");
	xtarea.value = content;

	block.appendChild(xtarea);

	return block;
};

/**************************************
afterDOMinsert(bid,data)
any code to run after the block has been attached to the dom

bid - the block id, so you can getElementById
data - this is always null, it might become something in later versions
***************************************/

this.afterDOMinsert = function(bid,data) {
	// this simple example requires no code after appending block to dom
};

/**************************************
saveContent(bid)
grab only the necessary values to save to the database and return them

bid - the block id, so you can getElementById
***************************************/

this.saveContent = function(bid) {
	var textstr = document.getElementById('bengine-a' + bid).children[0].value;
	return textstr;
};

/**************************************
showContent(block,content)
creates your block in show mode. attach your custom block to the block element and return the block

block - attach your custom block to this element
content - any content from the database
***************************************/

this.showContent = function(block,content) {
	var xtarea = document.createElement("textarea");
	xtarea.setAttribute("class","xTar-show"); // set class for styling
	xtarea.src = content;
    xtarea.setAttribute('readonly','true');

	block.appendChild(xtarea);

	return block;
};

/**************************************
add your custom css here

should contain two classes, one for edit mode & one for show mode
***************************************/

this.styleBlock = function() {
    var stylestr = \`
    .tarea {
    	max-width: 100%;
    	margin: 0px auto 0 auto;
    }

    .xTar, .xTar-show {
    	display: inline-block;
    	overflow-y: auto;

    	width: 100%;
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
    \`;

    return stylestr;
};

/**************************************
use this to attach functions you need during runtime.
you can use them by calling this.f.myfunction in other parts of this extensible.
you may have to use javascript's .bind() function when calling it.
***************************************/

this.f = {
    // our simple example requires no runtime functions
};

}
    `;

    var playCodeMirror = CodeMirror(playBlock,{
        value: playBlockStartCode,
        mode:  "javascript",
        lineWrapping: true
    });
    playCodeMirror.setSize(900,500);

    var loadBlockEngineBtnRow = document.createElement('div');
    loadBlockEngineBtnRow.setAttribute('class','row');

    var loadBlockEngineBtnCol = document.createElement('div');
    loadBlockEngineBtnCol.setAttribute('class','col col-100');

    function loadCustomBlock() {
        emptyDiv('content');
        var code = playCodeMirror.getValue();

        try {
            var BlockFunction = eval('(' + code + ')');
        } catch (e) {
            if (e instanceof SyntaxError) {
                alertify.alert(e.message);
            }
            return;
        }

        var blockObject = new BlockFunction();
        console.log(blockObject);
        blockExtensibles[blockObject.type] = blockObject;

        var playEngine = new Bengine(blockExtensibles,blockCustomFunctions,blockOptions);
        playEngine.blockEngineStart('content',['page',1,1],[]);
    }

    var loadBlockEngineBtn = btnSubmit('Load Custom Block',loadCustomBlock,'green');

    loadBlockEngineBtnCol.appendChild(loadBlockEngineBtn);
    loadBlockEngineBtnRow.appendChild(loadBlockEngineBtnCol);
    tutorial.appendChild(loadBlockEngineBtnRow);

    tutorial.appendChild(document.createElement('br'));
}
