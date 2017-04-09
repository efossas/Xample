/* eslint-env browser, es6 */
/******
	Title: Block Page
	This is the front-end for Xample Block Pages
******/

/***
	Section: Globals
	These are the global variables xample uses
***/

// <<<code>>>

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

var wiseEngine;
var blockExtensibles = {};
var blockGlobals = {};

blockExtensibles.xtext = new function xtext() {
	this.type = "xtext";
	this.name = "text";
	this.upload = false;

	var xtextObj = this;
	var blocklimit = 4095;

	var parseBlock = function(blockText) {
		var element = document.createElement('div');
		element.innerHTML = blockText.replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR");
		return encodeURIComponent(element.textContent).replace(/'/g,"%27");
	};

	var deparseBlock = function(blockText) {
		return decodeURIComponent(blockText).replace(/@@LT/g,"<").replace(/@@RT/g,">").replace(/@@BR/g,"<br>").replace(/%27/g,"'");
	};

	this.insertContent = function(block,content) {
		/* WYSIWIG uses iframe */
		var textBlock = document.createElement("iframe");
		textBlock.setAttribute("class","xTex");

		block.appendChild(textBlock);

		/* have to make a copy to use "this", when setTimout is called, this will refer to window, not block obj */
		var objCopy = this;

		/* iframe has to be put with document first or some bullshit, so wait one millisecond for that to happen and then insert content */
		setTimeout(function() {
			var iframe = block.childNodes[0].contentDocument;
			iframe.open();

			/* create link to css style for iframe content
			var cssLink = document.createElement("link");
			cssLink.href = "http://abaganon.com/css/block.css";
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";
			iframe.head.appendChild(cssLink); this can be used in show mode,not in edit mode
			*/

			/* defaul text */
			if(globalScope.defaulttext && content === "") {
				iframe.write("You can turn this default text off on your Profile Page.<br><br>Press&nbsp;<kbd>shift</kbd>&nbsp;and&nbsp;<kbd>ctrl</kbd>&nbsp;with the following keys to style text:<br><br><kbd>p</kbd>&nbsp;plain<br><kbd>b</kbd>&nbsp;<b>bold</b><br><kbd>i</kbd>&nbsp;<i>italics</i><br><kbd>h</kbd>&nbsp;<span style='background-color: yellow;'>highlight</span><br><kbd>+</kbd>&nbsp;<sup>superscript</sup><br><kbd>-</kbd>&nbsp;<sub>subscript</sub><br><kbd>a</kbd>&nbsp;<a href='http://abaganon.com/'>anchor link</a><ul><li><kbd>l</kbd>&nbsp;list</li></ul><kbd>j</kbd>&nbsp;justify left<br><i>For the things we have to learn before we can do them, we learn by doing them</i>. -Aristotle &nbsp;<i>I hear and I forget.&nbsp;I&nbsp;see and I remember. I do and I understand</i>. &nbsp;-? &nbsp;<i>If you want to go fast, go it alone. If you want to go far, go together.&nbsp;</i>-? &nbsp;<i>If you can't explain it simply, you don't understand it well enough.&nbsp;</i>-Einstein &nbsp;<i>Age is an issue of mind over matter. If you don't mind, it doesn't matter.</i>&nbsp;-Twain<br><br><kbd>f</kbd>&nbsp;justify full<div style='text-align: justify;'><i style='text-align: start;'>For the things we have to learn before we can do them, we learn by doing them</i><span style='text-align: start;'>. -Aristotle &nbsp;</span><i style='text-align: start;'>I hear and I forget.&nbsp;I&nbsp;see and I remember. I do and I understand</i><span style='text-align: start;'>. &nbsp;-? &nbsp;</span><i style='text-align: start;'>If you want to go fast, go it alone. If you want to go far, go together.&nbsp;</i><span style='text-align: start;'>-? &nbsp;</span><i style='text-align: start;'>If you can't explain it simply, you don't understand it well enough.&nbsp;</i><span style='text-align: start;'>-Einstein &nbsp;</span><i style='text-align: start;'>Age is an issue of mind over matter. If you don't mind, it doesn't matter.</i><span style='text-align: start;'>&nbsp;-Twain</span>");
			} else {
				iframe.write(deparseBlock(content));
			}
			iframe.close();

			var retblock = block.childNodes[0];

			/* attach keyboard shortcuts to iframe */
			if (iframe.addEventListener) {
				iframe.addEventListener("keydown",objCopy.f.detectKey.bind(null,retblock),false);
			} else if (iframe.attachEvent) {
				iframe.attachEvent("onkeydown",objCopy.f.detectKey.bind(null,retblock));
			} else {
				iframe.onkeydown = objCopy.f.detectKey.bind(null,retblock);
			}

			/* set limit on paste */
			iframe.onpaste = function(event) {
				var ptext;
				if (window.clipboardData && window.clipboardData.getData) {
					ptext = window.clipboardData.getData('Text');
				} else if (event.clipboardData && event.clipboardData.getData) {
					ptext = event.clipboardData.getData('text/plain');
				}

				if((this.children[0].childNodes[1].innerHTML.length + ptext.length) > blocklimit) {
					return false;
				} else {
					return true;
				}
			};
		},1);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		/* grab the block iframe that was just made */
		var blocki = document.getElementById("bengine-a" + bid).childNodes[0];
		var blockDoc = blocki.contentDocument;

		/* make iframe editable */
		blockDoc.designMode = "on";
	};

	this.saveContent = function(bid) {
		/* execCommand() applies style tags to <body> tag inside <iframe>, hence .getElementsByTagName('body')[0] */
		var blockContent = document.getElementById('bengine-a' + bid).children[0].contentDocument.getElementsByTagName('body')[0].innerHTML;
		return parseBlock(blockContent);
	};

	this.showContent = function(block,content) {
		var textBlock = document.createElement("div");
		textBlock.setAttribute("class","xTex-show");
		textBlock.innerHTML = deparseBlock(content);

		block.appendChild(textBlock);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xTex, .xTex-show {
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
		}

		.xTex-show {
			padding: 8px;
		}`;
		return stylestr;
	};

	this.f = {
		/*
			Function: detectKey

			This function is attached as the event listener to the WYSIWIG block. It detects key presses and calls the corresponding js built in execCommand() function on the block to apply html tags to the text. It's useful to note that iframe.contentDocument is the same as iframe.contentWindow.document.

			Parameters:

				iframe - an iframe node
				event - the keydown event that triggers the function

			Returns:

				none
		*/
		detectKey: function detectKey(iframe,event) {
			/* set limit */
			// iframe . document . html . body
			if(event.keyCode !== 8 && iframe.contentDocument.children[0].childNodes[1].innerHTML.length > blocklimit) {
				event.preventDefault();
			} else {
				/* p : plain */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 80) {
					iframe.contentDocument.execCommand('removeFormat',false,null);
				}
				/* b : bold */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 66) {
					iframe.contentDocument.execCommand('bold',false,null);
				}
				/* i : italics */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 73) {
					iframe.contentDocument.execCommand('italic',false,null);
				}
				/* h : highlight */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 72) {
					iframe.contentDocument.execCommand('backColor',false,"yellow");
				}
				/* l : list */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 76) {
					iframe.contentDocument.execCommand('insertUnorderedList',false,null);
				}
				/* + : superscript */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 187) {
					iframe.contentDocument.execCommand('superscript',false,null);
				}
				/* - : subscript */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 189) {
					iframe.contentDocument.execCommand('subscript',false,null);
				}
				/* j : justify left */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 74) {
					iframe.contentDocument.execCommand('justifyLeft',false,null);
				}
				/* f : justify full */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 70) {
					iframe.contentDocument.execCommand('justifyFull',false,null);
				}
				/* tab : indent */
				if(event.keyCode === 9) {
					iframe.contentDocument.execCommand('insertHTML',false,'&nbsp;&nbsp;&nbsp;&nbsp;');
				}
				/* a - anchor */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 65) {
					function callback(event,str) {
						if(event) {
							if (str.indexOf("http://") < 0 && str.indexOf("https://") < 0) {
								iframe.contentDocument.execCommand('createLink',false,"http://" + str);
							} else if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
								iframe.contentDocument.execCommand('createLink',false,str);
							} else {
								alertify.log("Not A Valid Link!","error");
							}
						} else { /* cancel */ }
					}
					alertify.prompt('Enter the link: ',callback,'http://');
				}

				/* Command + letter, works for these, but include for consistency */
				/* x : cut */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 88) {
					iframe.contentDocument.execCommand('cut',false,null);
				}
				/* c : copy */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 67) {
					iframe.contentDocument.execCommand('copy',false,null);
				}
				/* v : paste */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 86) {
					iframe.contentDocument.execCommand('paste',false,null);
				}
				/* z : undo */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 90) {
					iframe.contentDocument.execCommand('undo',false,null);
				}
				/* y : redo */
				if(event.shiftKey && event.ctrlKey && event.keyCode === 89) {
					iframe.contentDocument.execCommand('redo',false,null);
				}

				/// is this necessary ??
				event.stopPropagation();
			}
		}
	};
};

blockExtensibles.xcode = new function xcode() {
	this.type = "xcode";
	this.name = "code";
	this.upload = false;

	var xcodeObj = this;
	var blocklimit = 15; // these are lines <br>, not chars

	var parseBlock = function(blockText) {
		var element = document.createElement('div');
		element.innerHTML = blockText.replace(/<span[^>]*>/g,"").replace(/<\/span>/g,"").replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR");
		return encodeURIComponent(element.textContent).replace(/'/g,"%27");
	};

	var deparseBlock = function(blockText) {
		return decodeURIComponent(blockText).replace(/@@LT/g,"<").replace(/@@RT/g,">").replace(/@@BR/g,"<br>").replace(/%27/g,"'");
	};

	this.insertContent = function(block,content) {
		var codeBlock = document.createElement("code");
		codeBlock.setAttribute("class","xCde");
		codeBlock.onblur = function() {
			xcodeObj.f.renderCode(this);
		};
		codeBlock.contentEditable = true;

		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			codeBlock.innerHTML = "var description = 'Programming languages are auto-detected.';<br>function default(parameter) {<br>&nbsp;&nbsp;&nbsp;&nbsp;var instructions = 'When you click outside the block syntax is highlighted.';<br>&nbsp;&nbsp;&nbsp;&nbsp;alert(parameter + instructions);<br>}<br>default(description);";
		} else {
			codeBlock.innerHTML = deparseBlock(content);
		}

		block.appendChild(codeBlock);

		/* attach keyboard shortcuts to iframe */
		if (codeBlock.addEventListener) {
			codeBlock.addEventListener("keydown",this.f.codeKeys.bind(null,block),false);
		} else if (codeBlock.attachEvent) {
			codeBlock.attachEvent("onkeydown",this.f.codeKeys.bind(null,block));
		} else {
			codeBlock.onkeydown = this.f.codeKeys.bind(null,block);
		}

		/* set limit on paste */
		codeBlock.onpaste = function(event) {
			var ptext;
			if (window.clipboardData && window.clipboardData.getData) {
				ptext = window.clipboardData.getData('Text');
			} else if (event.clipboardData && event.clipboardData.getData) {
				ptext = event.clipboardData.getData('text/plain');
			}

			var breakCount = (this.innerHTML.match(/<br>/g) || []).length;
			var lineCount = (ptext.match(/\n/g) || []).length;

			if((breakCount + lineCount) >= blocklimit) {
				return false;
			} else {
				return true;
			}
		};

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		var codeBlock = document.getElementById('bengine-a' + bid).childNodes[0];
		this.f.renderCode(codeBlock);
	};

	this.saveContent = function(bid) {
		var blockContent = document.getElementById('bengine-a' + bid).children[0].innerHTML;
		return parseBlock(blockContent);
	};

	this.showContent = function(block,content) {
		var codeBlock = document.createElement("div");
		codeBlock.setAttribute("class","xCde-show");
		codeBlock.innerHTML = deparseBlock(content);

		block.appendChild(codeBlock);
		this.f.renderCode(codeBlock);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xCde, .xCde-show {
			white-space: pre-line;

			display: inline-block;
			width: 100%;
			height: 385px;
			border: 1px solid black;
			border-radius: 2px;
			background-color: white;

			line-height: 1.8em;
			word-wrap: break-word;
			overflow:hidden;

			background-image: -webkit-linear-gradient(#ccc, #ccc 3px, white 4px, white 18px, #ccc 19px, #ccc 32px);
		    background-image: -moz-linear-gradient(#ccc, #ccc 3px, white 4px, white 18px, #ccc 19px, #ccc 32px);
		    background-image: -ms-linear-gradient(#ccc, #ccc 3px, white 4px, white 18px, #ccc 19px, #ccc 32px);
		    background-image: -o-linear-gradient(#ccc, #ccc 3px, white 4px, white 18px, #ccc 19px, #ccc 32px);
			background-image: linear-gradient(#efefef, #efefef 5px, white 6px, white 28px, #efefef 29px, #efefef 50px);

			background-size: 100% 50px;

			padding: 4px 6px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};

	this.f = {
		/*
			Function: codeKeys

			This function is attached as the event listener to the code block. It detects key presses and applies styling.

			Parameters:

				block - the <code> tag
				event - the keydown event that triggers the function

			Returns:

				none
		*/
		codeKeys: function codeKeys(block,event) {
			var breakCount = (block.innerHTML.match(/(<br>|\n)/g) || []).length;
			if(event.keyCode === 13 && (breakCount + 1) >= blocklimit) {
				event.preventDefault();
			} else if(event.keyCode !== 8 && breakCount >= blocklimit) {
				event.preventDefault();
			} else {
				/* tab */
				if (event.keyCode === 9) {

					/* prevent default tab behavior */
					event.preventDefault();

					/* grab the cursor location */
					var doc = block.ownerDocument.defaultView;
					var sel = doc.getSelection();
					var range = sel.getRangeAt(0);

					/* insert 4 spaces representing a tab */
					var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
					range.insertNode(tabNode);

					/* replace cursor to after tab location */
					range.setStartAfter(tabNode);
					range.setEndAfter(tabNode);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		},
		/*
			Function: renderCode

			This function is a wrapper for whatever function parses and styles the code block. Validation might also be included in here.

			Parameters:

				block - the block to render

			Returns:

				none
		*/
		renderCode: function renderCode(block) {
			/* add code formatting */
			hljs.highlightBlock(block);
		}
	};
};

blockExtensibles.xmath = new function xmath() {
	this.type = "xmath";
	this.name = "math";
	this.upload = false;

	var xmathObj = this;
	var blocklimit = 2047;

	var parseBlock = function(blockText) {
		var element = document.createElement('div');
		element.innerHTML = blockText.replace(/\\/g,"\\\\").replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR");
		return encodeURIComponent(element.textContent).replace(/'/g,"%27");
	};

	var deparseBlock = function(blockText) {
		return decodeURIComponent(blockText).replace(/\\\\/g,'\\').replace(/@@LT/g,"<").replace(/@@RT/g,">").replace(/@@BR/g,"<br>").replace(/%27/g,"'");
	};

	this.insertContent = function(block,content) {
		var mathpreview = document.createElement('div');
		mathpreview.setAttribute('class','mathImage');

		var mathBlock = document.createElement('div');
		mathBlock.setAttribute('class','xMat');
		mathBlock.onblur = function() {
			xmathObj.f.renderMath(this);
		};
		mathBlock.contentEditable = true;
		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			mathBlock.innerHTML = 'AsciiMath \\ Mark \\ Up: \\ \\ \\ sum_(i=1)^n i^3=((n(n+1))/2)^2';
		} else {
			mathBlock.innerHTML = deparseBlock(content);
		}

		/* set limit function on keydown event */
		function setLimit(block,event) {
			if(event.keyCode !== 8 && block.innerText.length > blocklimit) {
				event.preventDefault();
			}
		}

		if (mathBlock.addEventListener) {
			mathBlock.addEventListener("keydown",setLimit.bind(null,block),false);
		} else if (mathBlock.attachEvent) {
			mathBlock.attachEvent("onkeydown",setLimit.bind(null,block));
		} else {
			mathBlock.onkeydown = setLimit.bind(null,block);
		}

		/* set limit on paste */
		mathBlock.onpaste = function(event) {
			var ptext;
			if (window.clipboardData && window.clipboardData.getData) {
				ptext = window.clipboardData.getData('Text');
			} else if (event.clipboardData && event.clipboardData.getData) {
				ptext = event.clipboardData.getData('text/plain');
			}

			if((this.innerText.length + ptext.length) > blocklimit) {
				return false;
			}
			return true;
		};

		block.appendChild(mathpreview);
		block.appendChild(mathBlock);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		this.f.renderMath(document.getElementById('bengine-a' + bid).childNodes[1]);
	};

	this.saveContent = function(bid) {
		/* replace() is for escaping backslashes */
		var blockContent = document.getElementById('bengine-a' + bid).children[1].innerHTML;
		return parseBlock(blockContent);
	};

	this.showContent = function(block,content) {
		var mathpreview = document.createElement('div');
		mathpreview.setAttribute('class','mathImage-show');

		var mathBlock = document.createElement('div');
		mathBlock.setAttribute('class','xMat');
		mathBlock.setAttribute('style','display:none;visibility:hidden;');
		mathBlock.innerHTML = deparseBlock(content);

		block.appendChild(mathpreview);
		block.appendChild(mathBlock);

		this.f.renderMath(mathBlock);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xMat {
			display: inline-block;
			width: 100%;
			height: 100px;
			border: 1px solid black;
			border-radius: 2px;
			background-color: white;

			padding: 4px 6px;
			margin: 2px 0 0 0;
			box-sizing: border-box;

			font-family: Arial, Helvetica, sans-serif;
		}

		.mathImage, .mathImage-show {
			display: inline-block;
			width: 100%;
			height: 200px;
			border: 1px solid black;
			border-radius: 2px;
			background-color: white;

			padding: 4px 6px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};

	this.f = {
		renderMath: function(block) {
			/* get the math notation and prepend/append backticks, which is how MathJax identifies ASCIIMath markup language */
			var str = "`" + block.textContent + "`";

			/* put the asciimath into the image preview block */
			var imageBlock = block.parentNode.childNodes[0];
			imageBlock.innerHTML = str;

			/* render the image */
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
		}
	};
};

blockExtensibles.latex = new function latex() {
	this.type = "latex";
	this.name = "latex";
	this.upload = false;

	var latexObj = this;
	var blocklimit = 2097;

	var parseBlock = function(blockText) {
		var element = document.createElement('div');
		element.innerHTML = blockText.replace(/\\/g,"\\\\").replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR");
		return encodeURIComponent(element.textContent).replace(/'/g,"%27");
	};

	var deparseBlock = function(blockText) {
		return decodeURIComponent(blockText).replace(/\\\\/g,'\\').replace(/@@LT/g,"<").replace(/@@RT/g,">").replace(/@@BR/g,"<br>").replace(/%27/g,"'");
	};

	this.insertContent = function(block,content) {
		var latexpreview = document.createElement('div');
		latexpreview.setAttribute('class','latexImage');

		var latexBlock = document.createElement('div');
		latexBlock.setAttribute('class','xLtx');
		latexBlock.onblur = function() {
			latexObj.f.renderLatex(this);
		};
		latexBlock.contentEditable = true;
		/* defaul text */
		if(globalScope.defaulttext && content === "") {
			latexBlock.innerHTML = 'LaTeX \\ Mark \\ Up: \\quad \\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)';
		} else {
			latexBlock.innerHTML = deparseBlock(content);
		}

		/* set limit function on keydown event */
		function setLimit(block,event) {
			if(event.keyCode !== 8 && block.innerText.length > blocklimit) {
				event.preventDefault();
			}
		}

		if (latexBlock.addEventListener) {
			latexBlock.addEventListener("keydown",setLimit.bind(null,block),false);
		} else if (latexBlock.attachEvent) {
			latexBlock.attachEvent("onkeydown",setLimit.bind(null,block));
		} else {
			latexBlock.onkeydown = setLimit.bind(null,block);
		}

		/* set limit on paste */
		latexBlock.onpaste = function(event) {
			var ptext;
			if (window.clipboardData && window.clipboardData.getData) {
				ptext = window.clipboardData.getData('Text');
			} else if (event.clipboardData && event.clipboardData.getData) {
				ptext = event.clipboardData.getData('text/plain');
			}

			if((this.innerText.length + ptext.length) > blocklimit) {
				return false;
			}
			return true;
		};

		block.appendChild(latexpreview);
		block.appendChild(latexBlock);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		this.f.renderLatex(document.getElementById('bengine-a' + bid).childNodes[1]);
	};

	this.saveContent = function(bid) {
		/* replace() is for escaping backslashes */
		var blockContent = document.getElementById('bengine-a' + bid).children[1].innerHTML;
		return parseBlock(blockContent);
	};

	this.showContent = function(block,content) {
		var latexpreview = document.createElement('div');
		latexpreview.setAttribute('class','latexImage-show');

		var latexBlock = document.createElement('div');
		latexBlock.setAttribute('class','xLtx');
		latexBlock.setAttribute('style','display:none;visibility:hidden;');
		latexBlock.innerHTML = deparseBlock(content);

		block.appendChild(latexpreview);
		block.appendChild(latexBlock);

		this.f.renderLatex(latexBlock);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xLtx {
			display: inline-block;
			width: 100%;
			height: 100px;
			border: 1px solid black;
			border-radius: 2px;
			background-color: white;

			padding: 4px 6px;
			margin: 2px 0 0 0;
			box-sizing: border-box;
		}

		.latexImage, .latexImage-show {
			display: inline-block;
			width: 100%;
			height: 200px;
			border: 1px solid black;
			border-radius: 2px;
			background-color: white;

			padding: 4px 6px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};

	this.f = {
		renderLatex: function(block) {
			/* get the math notation and prepend/append double dollars, which is how MathJax identifies LaTeX markup language */
			var str = "$$" + block.textContent + "$$";

			/* put the latex into the image preview block */
			var imageBlock = block.parentNode.childNodes[0];
			imageBlock.innerHTML = str;

			/* render the image */
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,imageBlock]);
		}
	};
};

blockExtensibles.image = new function image() {
	this.type = "image";
	this.name = "image";
	this.upload = true;

	var imageObj = this;

	this.insertContent = function(block,content) {
		var ximg = document.createElement("img");
		ximg.setAttribute("class","xImg");
		ximg.src = content;

		block.appendChild(ximg);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		if(data !== null) {
			var imagetag = document.getElementById('bengine-a' + bid).childNodes[0];
			imagetag.src = data;
		}
	};

	this.saveContent = function(bid) {
		/* replace() is for escaping backslashes and making relative path */
		var imagestr = document.getElementById('bengine-a' + bid).children[0].src;
		return imagestr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	};

	this.showContent = function(block,content) {
		var ximg = document.createElement("img");
		ximg.setAttribute("class","xImg-show");
		ximg.src = content;

		block.appendChild(ximg);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xImg, .xImg-show {
			display: inline-block;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 2px;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};
};

blockExtensibles.audio = new function audio() {
	this.type = "audio";
	this.name = "audio";
	this.upload = true;

	var audioObj = this;

	this.insertContent = function(block,content) {
		var audio = document.createElement("audio");
		audio.setAttribute("class","xAud");
		audio.volume = 0.8;
		audio.setAttribute("controls","controls");

		var audiosource = document.createElement("source");
		audiosource.setAttribute("src",content);
		audiosource.setAttribute("type","audio/mpeg");

		audio.appendChild(audiosource);
		block.appendChild(audio);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		if(data !== null) {
			/* audio & video divs have their src set in an extra child node */
			var mediatag = document.getElementById('bengine-a' + bid).childNodes[0].childNodes[0];
			mediatag.src = data;
			mediatag.parentNode.load();
		}
	};

	this.saveContent = function(bid) {
		var mediastr = document.getElementById('bengine-a' + bid).children[0].children[0].src;
		return mediastr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	};

	this.showContent = function(block,content) {
		var audio = document.createElement("audio");
		audio.setAttribute("class","xAud-show");
		audio.volume = 0.8;
		audio.setAttribute("controls","controls");

		var audiosource = document.createElement("source");
		audiosource.setAttribute("src",content);
		audiosource.setAttribute("type","audio/mpeg");

		audio.appendChild(audiosource);
		block.appendChild(audio);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xAud, .xAud-show {
			display: inline-block;
			width: 100%;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};
};

blockExtensibles.video = new function video() {
	this.type = "video";
	this.name = "video";
	this.upload = true;

	var videoObj = this;

	this.insertContent = function(block,content) {
		var video = document.createElement("video");
		video.setAttribute("class","xVid");
		video.volume = 0.8;
		video.setAttribute("controls","controls");

		var videosource = document.createElement("source");
		videosource.setAttribute("src",content);
		videosource.setAttribute("type","video/mp4");

		video.appendChild(videosource);
		block.appendChild(video);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		if(data !== null) {
			/* audio & video divs have their src set in an extra child node */
			var mediatag = document.getElementById('bengine-a' + bid).childNodes[0].childNodes[0];
			mediatag.src = data;
			mediatag.parentNode.load();
		}
	};

	this.saveContent = function(bid) {
		var mediastr = document.getElementById('bengine-a' + bid).children[0].children[0].src;
		return mediastr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	};

	this.showContent = function(block,content) {
		var video = document.createElement("video");
		video.setAttribute("class","xVid-show");
		video.volume = 0.8;
		video.setAttribute("controls","controls");

		var videosource = document.createElement("source");
		videosource.setAttribute("src",content);
		videosource.setAttribute("type","video/mp4");

		video.appendChild(videosource);
		block.appendChild(video);

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xVid, .xVid-show {
			display: inline-block;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 2px;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};
};

blockExtensibles.slide = new function slide() {
	(function() {
		blockGlobals.pdfObjects = {};
	})();

	this.type = "slide";
	this.name = "slide";
	this.upload = true;

	var slideObj = this;

	this.insertContent = function(block,content) {
		/* data-page attribute keeps track of which page is being displayed */
		var canvas = document.createElement("canvas");
		canvas.setAttribute("class","xSli");
		canvas.setAttribute("id",content);
		canvas.setAttribute("data-page","1");

		block.appendChild(canvas);

		/* if block was just made, don't try to load pdf */
		if (content !== "") {
			PDFJS.getDocument(content).then(function(pdfObj) {
				blockGlobals.pdfObjects[content] = pdfObj;

				var tag = block.childNodes[0];

				blockExtensibles.slide.f.renderPDF(pdfObj,1,tag);
			});
		}

		/* event listener for changing slides left & right */
		block.onmouseup = function(event) {
			var X = event.pageX - this.offsetLeft;
			/// var Y = event.pageY - this.offsetTop;

			/* get the <canvas> tag, current page, pdf url/id, and the pdf total page count */
			var canvas = this.childNodes[0];
			var pageNum = canvas.getAttribute("data-page");
			var pdfID = canvas.getAttribute("id");
			var pageCount = blockGlobals.pdfObjects[pdfID].numPages;

			/* determine whether left or right side was clicked, then render prev or next page */
			if(X > this.offsetWidth / 1.7) {
				if(pageNum < pageCount) {
					pageNum++;
					canvas.setAttribute("data-page",pageNum);
					blockExtensibles.slide.f.renderPDF(blockGlobals.pdfObjects[pdfID],pageNum,canvas);
				}
			} else {
				if(pageNum > 1) {
					pageNum--;
					canvas.setAttribute("data-page",pageNum);
					blockExtensibles.slide.f.renderPDF(blockGlobals.pdfObjects[pdfID],pageNum,canvas);
				}
			}
		};

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		var objCopy = this;
		if(data !== null) {
			/* add the pdf to the pdfObjects array and render the first page */
			PDFJS.getDocument(data).then(function(pdfObj) {

				blockGlobals.pdfObjects[data] = pdfObj;

				var slidetag = document.getElementById('bengine-a' + bid).childNodes[0];
				slidetag.setAttribute("id",data);

				objCopy.f.renderPDF(pdfObj,1,slidetag);
			});
		}
	};

	this.saveContent = function(bid) {
		var slidestr = document.getElementById('bengine-a' + bid).children[0].id;
		return slidestr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	};

	this.showContent = function(block,content) {
		/* data-page attribute keeps track of which page is being displayed */
		var canvas = document.createElement("canvas");
		canvas.setAttribute("class","xSli-show");
		canvas.setAttribute("id",content);
		canvas.setAttribute("data-page","1");

		block.appendChild(canvas);

		/* if block was just made, don't try to load pdf */
		if (content !== "") {
			PDFJS.getDocument(content).then(function(pdfObj) {
				blockGlobals.pdfObjects[content] = pdfObj;

				var tag = block.childNodes[0];

				blockExtensibles.slide.f.renderPDF(pdfObj,1,tag);
			});
		}

		/* event listener for changing slides left & right */
		block.onmouseup = function(event) {
			var X = event.pageX - this.offsetLeft;
			/// var Y = event.pageY - this.offsetTop;

			/* get the <canvas> tag, current page, pdf url/id, and the pdf total page count */
			var canvas = this.childNodes[0];
			var pageNum = canvas.getAttribute("data-page");
			var pdfID = canvas.getAttribute("id");
			var pageCount = blockGlobals.pdfObjects[pdfID].numPages;

			/* determine whether left or right side was clicked, then render prev or next page */
			if(X > this.offsetWidth / 1.7) {
				if(pageNum < pageCount) {
					pageNum++;
					canvas.setAttribute("data-page",pageNum);
					blockExtensibles.slide.f.renderPDF(blockGlobals.pdfObjects[pdfID],pageNum,canvas);
				}
			} else {
				if(pageNum > 1) {
					pageNum--;
					canvas.setAttribute("data-page",pageNum);
					blockExtensibles.slide.f.renderPDF(blockGlobals.pdfObjects[pdfID],pageNum,canvas);
				}
			}
		};

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xSli, .xSli-show {
			display: inline-block;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 2px;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};

	this.f = {
		renderPDF: function(pdfDoc,pageNum,canvas) {
			/*
				pdfDoc - pdf object from pdfObject global array
				pageNum - pdf page to render, found in data-page attribute of <canvas>
				canvas - the <canvas> tag to render pdf page to
			*/

			/// I have no idea what scale does, but it's needed
			var scale = 0.8;

			/* call pdfDoc object's getPage function to get desired page to render */
			pdfDoc.getPage(pageNum).then(function(page) {

				/* define <canvas> attributes */
				var viewport = page.getViewport(scale);
				canvas.height = viewport.height;
				canvas.width = viewport.width;

				/* define more <canvas> attributes for render() function */
				var renderContext = {
					canvasContext: canvas.getContext('2d'),
					viewport: viewport
				};

				/* finally, render the pdf page to canvas */
				var renderTask = page.render(renderContext);

				renderTask.promise.then(function() {
					/// update stuff here, page has been rendered
				});
			});
		}
	};
};

/*
blockExtensibles.xsvgs = new function xsvgs() {
	this.type = "xsvgs";
	this.name = "svg";
	this.upload = false;

	this.insertContent = function(block,content) {
		var xsvgs = document.createElement("div");
		xsvgs.setAttribute("class","xSvg");
		xsvgs.setAttribute("data-link",content);

		if(content !== "") {
			/// insert <svg> with data
		}

		block.appendChild(xsvgs);

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		/// var svgtag = document.getElementById('bengine-a' + bid).childNodes[0];
		/// replace below with svgtag.innrHTML = success;
		/// svgtag.setAttribute("data-link",success);
	};

	this.saveContent = function(bid) {
		var svgstr = document.getElementById('bengine-a' + bid).childNodes[0].getAttribute("data-link");
		return svgstr.replace(location.href.substring(0,location.href.lastIndexOf('/') + 1),"");
	};

	this.showContent = function(block,content) {
		block.innerHTML = content;
		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xSvg {
			display: inline-block;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 2px;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};
};
*/

blockExtensibles.title = new function title() {
	this.type = "title";
	this.name = "title";
	this.upload = false;

	var titleObj = this;
	var blocklimit = 64;

	var parseBlock = function(blockText) {
		var element = document.createElement('div');
		element.innerHTML = blockText.replace(/</g,"@@LT").replace(/>/g,"@@RT").replace(/<br>/g,"@@BR");
		return encodeURIComponent(element.textContent).replace(/'/g,"%27");
	};

	var deparseBlock = function(blockText) {
		return decodeURIComponent(blockText).replace(/@@LT/g,"<").replace(/@@RT/g,">").replace(/@@BR/g,"<br>").replace(/%27/g,"'");
	};

	this.insertContent = function(block,content) {
		var str = '<input type="text" class="xTit" maxlength="' + blocklimit + '" value="' + deparseBlock(content) + '">';
		block.innerHTML = str;

		return block;
	};

	this.afterDOMinsert = function(bid,data) {
		/* nothing to do */
	};

	this.saveContent = function(bid) {
		var blockContent = document.getElementById('bengine-a' + bid).children[0].value;
		return parseBlock(blockContent);
	};

	this.showContent = function(block,content) {
		var str = '<div class="xTit-show">' + deparseBlock(content) + '</div>';
		block.innerHTML = str;

		return block;
	};

	this.styleBlock = function() {
		var stylestr = `.xTit {
			display: inline-block;
			width: 100%;
			height: 32px;
			border: 1px solid black;
			border-radius: 2px;

			padding: 4px 6px;
			margin: 0px;
			box-sizing: border-box;

			text-align: center;

			font-family: Arial, Helvetica, sans-serif;
			font-size: 1em;
			font-weight: 300;
			color: black;
		}

		.xTit-show {
			display: inline-block;
			width: 100%;
			height: 46px;
			background-color: rgba(118, 118, 118, 0.2);
			border: 1px solid black;
			border-bottom-color: rgba(118, 118, 118, 0.2);
			border-radius: 2px;

			padding: 6px 6px;
			margin: 0px;
			margin-bottom: -12px;
			box-sizing: border-box;

			text-align: center;

			font-family: Arial, Helvetica, sans-serif;
			font-size: 2em;
			font-weight: 900;
			color: black;
		}`;
		return stylestr;
	};
};

// <<<fold>>>

/***
	Section: Helper Functions
	These are helper functions.
***/

// <<<code>>>

/*
	Function: loadWhichPage

	This function loads the either the user's temporary or permanent block page.

	Parameters:

		pid - string, the page id
		which - string, either 'temp' or 'perm'

	Returns:

		nothing - *
*/
function loadWhichPage(pid,which) {
	var status;
	if(which === 'temp') {
		status = 'true';
	} else if (which === 'perm') {
		status = 'false';
	} else {
		return;
	}

	/* redirect to correct page */
	var url = createURL("/editpage?page=" + pid + "&temp=" + status);
	window.location = url;
}

// <<<fold>>>

/***
	Section: Page Functions
	These are the only functions called directly by back-end to start a page.
***/

// <<<code>>>

/*
	Function: pageChoose

	This function loads the choose page display. A user is given the option to either load their last permanent save or their last temporary save.

	Parameters:

		pid - the page id

	Returns:

		nothing - *
*/
function pageChoose(pid) {

	/* row 1 */
	var rowOne = document.createElement("div");
	rowOne.setAttribute("class","row");

	var colMiddle = document.createElement("div");
	colMiddle.setAttribute("class","col col-100 pad-10");

	var centerParagraph = document.createElement("p");
	centerParagraph.innerHTML = "You are viewing this because the page was closed without Revert or Save being clicked. Please choose which page you want to save.";

	colMiddle.appendChild(centerParagraph);
	rowOne.appendChild(colMiddle);

	/* row 2 */
	var rowTwo = document.createElement("div");
	rowTwo.setAttribute("class","row");

	var colLeft = document.createElement("div");
	colLeft.setAttribute("class","col col-50 pad-10");

	var colRight = document.createElement("div");
	colRight.setAttribute("class","col col-50 pad-10");

	rowTwo.appendChild(colLeft);
	rowTwo.appendChild(colRight);

	var leftParagraph = document.createElement("p");
	leftParagraph.innerHTML = "This is your last temporary save. This save contains the blocks from the last time you added a block.";

	var tempBtn = document.createElement('button');
	tempBtn.setAttribute('type','button');
	tempBtn.setAttribute('class','menubtn green-btn');
	tempBtn.setAttribute('value','submit-temp');
	tempBtn.setAttribute('onclick','loadWhichPage(' + pid + ',"temp");');
	tempBtn.innerHTML = "Temporary Page";

	var rightParagraph = document.createElement("p");
	rightParagraph.innerHTML = "This is you last permanent save. This save contains the blocks from the last time you clicked Save.";

	var permBtn = document.createElement('button');
	permBtn.setAttribute('type','button');
	permBtn.setAttribute('class','menubtn green-btn');
	permBtn.setAttribute('value','submit-perm');
	permBtn.setAttribute('onclick','loadWhichPage(' + pid + ',"perm");');
	permBtn.innerHTML = "Permanent Page";

	colLeft.appendChild(tempBtn);
	colLeft.appendChild(leftParagraph);
	colRight.appendChild(permBtn);
	colRight.appendChild(rightParagraph);

	/* main */
	var main = document.getElementById("content");
	main.appendChild(rowOne);
	main.appendChild(rowTwo);
}

/*
	Function: pageEdit

	This function loads page data in edit mode.

	Parameters:

		aid - number, the author id; which is the uid of the creator of the block page
		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageEdit(aid,pagedata,pageinfo) {
	/* grab the main div */
	var main = document.getElementById('content');

	/* hidden pid & title */
	var pid = pageinfo.id;
	var pagename = pageinfo.name;

	/*** MENU & STATUS BAR ***/

	/* create menu & status bar */
	var menu = barMenu();
	var status = barStatus(pid);
	var pageSettings = barPageSettings('page',aid,pageinfo);

	/* create submenu */
	var submenu = barSubMenu('Page Settings',pageSettings);

	/* append menu & status to main */
	main.appendChild(menu);
	main.appendChild(status);
	main.appendChild(submenu);

	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	var blockOptions = {
		blockLimit:8
	};
	wiseEngine = new Bengine(blockExtensibles,blockGlobals,{},blockOptions);

	wiseEngine.blockEngineStart('content',["page",pid,pid],blockarray);

	/*** AFTER STUFF ***/

	/* start auto save timer */
	autosaveTimer(document.getElementById("bengine-autosave"),function() {
		return wiseEngine.saveBlocks(true);
	});

	/* set defaulttext in globals */
	var promiseDefaultText = getUserFields(['defaulttext']);

	promiseDefaultText.then(function(data) {
		if(data.defaulttext) {
			globalScope.defaulttext = true;
		} else {
			globalScope.defaulttext = false;
		}
	},function(error) {
		globalScope.defaulttext = false;
		alertify.alert("Error. Default Text Could Not Be Initiated.");
	});

	/* prevent user from exiting page if Revert or Save has not been clicked */
	window.onbeforeunload = function() {
		var status = document.getElementById("bengine-statusid").value;
		if(status === '0') {
			/// this text isn't being displayed... some default is instead
			return "Please click Revert or Save before exiting.";
		}
		return null;
	};
}

/*
	Function: pageEmbed

	This function loads page data in show mode & embed style.

	Parameters:

		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageEmbed(pagedata,pageinfo) {
	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	wiseEngine = new Bengine(blockExtensibles,blockGlobals,{},{enableSingleView:true});
	wiseEngine.blockContentShow('content-embed',["page",pageinfo.id],blockarray);
}

/*
	Function: pageShow

	This function loads page data in show mode.

	Parameters:

		logstatus - boolean, true if logged in or false otherwise.
		mtoggle - boolean, true displays all & false displays only blocks
		pagedata - string, page data is received in the format "type,content,type,content,etc."
		pageinfo - json string, page info is what goes into the settings

	Returns:

		nothing - *
*/
function pageShow(logstatus,mtoggle,pagedata,pageinfo) {
	/* grab the main div */
	var main = document.getElementById('content');

	/* hidden pid & title */
	var pid = pageinfo.id;
	var pagename = pageinfo.name;

	if(mtoggle) {

		/* watermark */
		main.appendChild(watermark());

		/*** MENU BAR ***/

		/* create menu & info bar */
		var menu;
		if(logstatus === true) {
			menu = barMenu();
		} else {
			menu = barLog();
		}
		var info = barInfo('page',pageinfo);

		/* append menu & status to main */
		main.appendChild(menu);
		main.appendChild(info);

		var spaceDiv = document.createElement('div');
		spaceDiv.setAttribute('style','padding-bottom:20px;');
		main.appendChild(spaceDiv);

		/* page title input */
		var title = document.createElement('input');
		title.setAttribute('type','text');
		title.setAttribute('name','pagename');
		title.setAttribute('class','page-title');
		title.setAttribute('maxlength','50');
		title.setAttribute('value',pagename);
		title.setAttribute('style','display: none;');
		menu.appendChild(title);

	}

	/*** BLOCKS ***/

	/* block array -> mediaType-1,mediaContent-1,mediaType-2,mediaContent-2,etc */
	var blockarray;
	if(pagedata !== "") {
		blockarray = pagedata.split(',');
	} else {
		blockarray = [];
	}

	wiseEngine = new Bengine(blockExtensibles,blockGlobals,{},{});

	wiseEngine.blockContentShow('content',["page",pid],blockarray);

	/* set time out to register view */
	setTimeout(function() {
		setView('page',pageinfo.aid,pageinfo.id);
	},61000);
}

// <<<fold>>>
