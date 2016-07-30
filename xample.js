/* eslint-env node, es6 */
/*
	Section: Xample

	This is the server for Xample
*/

/*
	Section: Modules

	These are the modules xample uses

	page - imports the functions that handl xample url requests
	http - ??? was using this to start a server, but this might not be needed since express module is used now
	express - used to start a server and page routing
	session - used with express to add sessions for users
	busboy - used to parse media data (file uploads)
*/

/* global require:true */
/* global process:true */

var page = require('./page.js');
var express = require('express');
var busboy = require('connect-busboy');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

/*
	Section: Server Exit
	These functions handle uncaught errors and program exit procedure
*/

function slack(message) {
	var request = require('request');

	var postData = {};
	postData.username = "xample-error";
	postData.icon_emoji = ":rage:";
	// postData.channel = "#error";
	postData.text = message;

	var option = {
		url:   'https://hooks.slack.com/services/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',
		body:  JSON.stringify(postData)
	};

	request.post(option,function(err,res,body) {
		if(body == "ok" && !err) {
			console.log("Error Sent To Slack");
		}
	});
}

/* prevents node from exiting on error */
process.on('uncaughtException',function(err) {
	console.log('666 ' + err);

	slack(err);
});

/* ensures stdin continues after uncaught exception */
process.stdin.resume();

/*
	Function: exitHandler
	Used to run code when the program exits. Called on SIGINT (ctrl^c)

	Parameters:

		none

	Returns:

		nothing - *
*/
function exitHandler() {
	console.log('\nClean up routine complete. Xample app terminated.');
    process.exit();
}

/* calls exitHandler() on SIGINT, ctrl^c */
process.on('SIGINT',exitHandler);

/*
	Section: Create Server
	These functions create a server, set it up, and route url addresses. An asterisks indicates that a get link may follow.

	index - start
	signup - signup
	login - login
	logout - logout
	createpage - createpage
	getpages - getpages
	editpage* - editpage
	saveblocks - saveblocks
	uploadmedia* - uploadmedia
*/

/* create express server */
var app = express();

/* remove from http headers */
app.disable('x-powered-by');

/* set up static file routes */
app.use(express.static('../public_html'));

/* set up sessions */
app.use(session({
	key : 'xsessionkey',
	secret: 'KZtX0C0qlhvi)d',
	resave: false,
	saveUninitialized: false,
	store: new MySQLStore({host: 'localhost',
		user: 'nodesql',
		password: 'Vup}Ur34',
		database: "xsessionstore"
	})
}));

/* set up busboy */
app.use(busboy());

/* routes */
app.get('/',page.start);
app.post('/signup',page.signup);
app.post('/login',page.login);
app.post('/logout',page.logout);
app.post('/createpage',page.createpage);
app.post('/getpages',page.getpages); // breaks REST ??
app.get('/editpage*',page.editpage);
app.post('/saveblocks',page.saveblocks);
app.post('/uploadmedia*',page.uploadmedia); // breaks REST ?? uses get query with post method
app.get('/profile',page.profile);
app.post('/saveprofile',page.saveprofile);
app.post('/getprofiledata',page.getprofiledata);
app.post('/revert',page.revert);

app.all('*',page.notfound);

/* activate the server */
app.listen(2020);
