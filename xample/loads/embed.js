/* eslint-env node, es6 */
/*
	Title: Page
	Loads block page in show mode.
*/

var analytics = require('./../analytics.js');
var helper = require('./../helper.js');
var loader = require('./loader.js');
var queryPageDB = require('./../querypagedb.js');

var embedTutorial = function(request,response) {
	loader.loadEmbedPage(request,response,"<script>pageEmbed('title,How%20To%20Use%20Binomial%20Distribution,xtext,%40%40LTspan%20style%3D%22box-sizing%3A%20border-box%3B%22%40%40RTBinomial%20distribution%20answers%20this%20question%3A%20%40%40LTb%40%40RTIf%20there%20are%202%20possible%20outcomes%2C%20A%20or%20B%2C%20what%20is%20the%20probability%20that%20A%20will%20occur%20X%20amount%20of%20times%20over%20Y%20trials%3F%40%40LT%2Fb%40%40RT%20Use%20the%20equation%20below%2C%20where%20P%20is%20the%20probability%20that%20A%20occurs%20in%20a%20single%20trial%20%26%20Q%20is%20the%20probability%20that%20B%20occurs%20in%20a%20single%20trial.%40%40LT%2Fspan%40%40RT,xmath,(%20(%20Y!%20)%20%2F%20(%20X!(Y-X)!%20)%20)%20(%20P%5EX%20)%20(%20Q%5E(Y-X)%20)%C2%A0,title,Simple%20Rolling%20A%20Die%20Example,xtext,The%20probability%20of%20a%20rolling%201%20through%205%20on%20a%206%20sided%20die%208%20times%20out%20of%2010%20rolls%20would%20be%3A,xmath,(%20(%2010!%20)%20%2F%20(%208!(10-8)!%20)%20)%20(5%2F6)%5E8%20(1%2F6)%5E(10-8)%20%3D%20%C2%A00.2907%20or%2029.07%25,xtext,Binomial%20distribution%20can%20only%20solve%20problems%20with%20<b>Bernoulli%20Random%20Variables</b>%2C%20which%20are%20situations%20with%20only%20two%20possible%20outcomes.%20This%20works%20with%20dice%2C%20if%20we%20are%20interested%20in%20probabilities%20where%20outcome%20A%20contains%20some%20of%20the%20dice%20numbers%20and%20outcome%20B%20contains%20the%20rest.%20If%20you%20want%20to%20solve%20for%20a%20situation%20where%20there%20are%20multiple%20outcomes%2C%20you%20need%20to%20use%20<b>Multinomial%20Distribution</b>.<br><br>I%20will%20leave%20you%20with%20a%20comic%20on%20the%20next%20block%20that%20shows%20you%20how%20statistics%20can%20help%20you%20in%20school...,image,https://nebusresearch.files.wordpress.com/2016/10/rick-kirkman-jerry-scott_baby-blues_22-october-2016.gif',{id:0});</script>");
};

/*
	Function: page

	Page Show Mode, used to get a list of page & block data for a user's page. The data given to the http response is a comma-separate string in this format. pid,pagename,mediaType,mediaContent, If the author does not have a page with that pid, they will receive "err" in the response. If the author has no media on that page, the user will only receive the pid and pagename.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.embed = function(request,response) {
	var __function = "embed";

    var pool = request.app.get("pool");
	var cachedb = request.app.get("cachedb");

	/* get the author's id & pid from the get request */
	var aid = request.query.a;
	var pid = request.query.p;

	/* detect is the user is logged in for views */
	var uid;
	if(request.session.uid) {
		uid = request.session.uid;
	} else {
		uid = 0;
	}

	if(aid === "tutorial") {
		embedTutorial(request,response);
		analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
		return;
	}

	var body = '';
	request.on('data',function(data) {
		body += data;

		/* prevent overload attacks */
		if (body.length > 1e6) {
			request.connection.destroy();
			var errmsg = {message:"Overload Attack!"};
			analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
		}
	});

	/* redirect users if logged out or no page id provided */
	if(typeof aid === 'undefined' || typeof pid === 'undefined') {
        loader.loadEmbedPage(request,response,"<script>pageError('badquerystring');</script>");
    } else {
		request.on('end',function() {
			pool.getConnection(function(err,connection) {
				if(err || typeof connection === 'undefined') {
					loader.loadEmbedPage(request,response,"<script>pageError('dberr');</script>");
					analytics.journal(true,221,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
				} else {
					var prefix = helper.getTablePrefixFromPageType('page');

					var promiseSettings = queryPageDB.getPageSettings(connection,prefix,aid,pid);

					promiseSettings.then(function(pageSettings) {
						if(pageSettings.err === 'notfound') {
							loader.loadEmbedPage(request,response,"<script>pageError('dberr');</script>");
							analytics.journal(true,201,{message:'getPageSettings()'},uid,global.__stack[1].getLineNumber(),__function,__filename);
						} else {
							/* change to generic names for front-end bar script */
							pageSettings['id'] = pageSettings['xid'];
							delete pageSettings['xid'];
							pageSettings['name'] = pageSettings['xname'];
							delete pageSettings['xname'];
							pageSettings['author'] = pageSettings['username'];
							delete pageSettings['username'];

							pageSettings['aid'] = aid;

							var pageinfo = JSON.stringify(pageSettings);

							var qry = "SELECT type,content FROM " + prefix + "_" + aid + "_" + pid;

							connection.query(qry,function(err,rows,fields) {
								if(err) {
									loader.loadEmbedPage(request,response,"<script>pageError('dberr');</script>");
									analytics.journal(true,202,err,uid,global.__stack[1].getLineNumber(),__function,__filename);
								} else {
									var pagedata = "";

									/* i is for accessing row array, j is for keeping track of rows left to parse */
									var i = 0;
									var j = rows.length;

									/* append commas to each row except for the last one */
									while(j > 1) {
										pagedata += rows[i].type + "," + rows[i].content + ",";
										i++;
										j--;
									}
									if(j === 1) {
										pagedata += rows[i].type + "," + rows[i].content;
									}

									helper.determineView(request,response,'page',cachedb,uid,aid,pid);

									/* load with the page data */
									loader.loadEmbedPage(request,response,"<script>pageEmbed('" + pagedata + "'," + pageinfo + ");</script>");
									analytics.journal(false,0,"",uid,global.__stack[1].getLineNumber(),__function,__filename);
								}
							});
						}
					});
					connection.release();
				}
			});
        });
	}
};
