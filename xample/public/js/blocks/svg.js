extensibles.xsvgs = new function xsvgs() {
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
		/// var svgtag = document.getElementById(bid).childNodes[0];
		/// replace below with svgtag.innrHTML = success;
		/// svgtag.setAttribute("data-link",success);
	};

	this.saveContent = function(bid) {
		var svgstr = document.getElementById(bid).childNodes[0].getAttribute("data-link");
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
			height: 506px;
			border: 1px solid black;
			border-radius: 2px;

			padding: 0px;
			margin: 0px;
			box-sizing: border-box;
		}`;
		return stylestr;
	};
};
