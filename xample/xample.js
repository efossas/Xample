/* eslint-env node, es6 */
// random test comment
/*
	Section: Xample

	This is the server for Xample
*/

/*
	Section: Command Line
	This section processes command line arguments
*/

// <<<code>>>

/* grab command line arguments, 0 -> node, 1 -> path to .js, 2+ -> actual arguments */
var port;
var host;

switch(process.argv.length) {
	case 4:
		port = Number(process.argv[3]);
		host = process.argv[2];
		break;
	case 3:
		port = 2020;
		host = process.argv[2];
		break;
	default:
		console.log("Wrong number of arguments. Usage: node xample.js [local|remote] [port]");
		process.exit();
}

/* check for that valid port number was given */
if(port > 65535 || port < 1) {
	console.log("Invalid port number. Port argument must be between 1 & 65535");
	process.exit();
}

/* check that valid host option was given */
var root;
switch(host) {
	case "local":
		root = "http://localhost:" + port + "/";
		break;
	case "remote":
		root = "http://abaganon.com/xample/";
		break;
	default:
		console.log("Incorrect value for arg 1. Usage: node xample.js [local|remote] [port]");
		process.exit();
}

// <<<fold>>>

/*
	Section: Modules

	These are the modules xample uses

	page - imports the functions that handle xample url requests
	express - used to start a server and page routing
	busboy - used to parse media data (file uploads)
	session - used with express to add sessions for users
	MySQLStore - used for persistent sessions
*/

// <<<code>>>

/* global require:true */
/* global process:true */

var page = require('./page.js');
var express = require('express');
var busboy = require('connect-busboy');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// <<<fold>>>

/*
	Section: Prototypes
	These are additions or changes to js prototypes
*/

// <<<code>>>

/* express requests will have root which is the http path to this server */
express.request.root = root;

// <<<fold>>>

/*
	Section: Server Exit
	These functions handle uncaught errors and program exit procedure
*/

// <<<code>>>

function slack(message) {
	var request = require('request');

	var postData = {};
	postData.username = "xample-error";
	postData.icon_emoji = ":rage:";
	// postData.channel = "#error";
	postData.text = message;

	var option = {
		url:   'https:///hooks.slack.com/services/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',
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

// <<<fold>>>

/*
	Section: Create Server
	These functions create a server, set it up, and route url addresses. An asterisks indicates that a get link may follow.
*/

// <<<code>>>

/* create express server */
var app = express();

/* remove from http headers */
app.disable('x-powered-by');

/* set up static file routes */
app.use(express.static('../public_html'));

/* set up sessions */
/// todo: this is a hack, sessionStore needs to work on remote & local.
if(host === "local") {
	app.use(session({
		key : 'xsessionkey',
		secret: 'KZtX0C0qlhvi)d',
		resave: false,
		saveUninitialized: false
	}));
} else {
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
}


/* set up busboy */
app.use(busboy());

/* routes */
app.get('/',page.start);
app.post('/signup',page.signup);
app.post('/login',page.login);
app.post('/logout',page.logout);
app.post('/createpage',page.createpage);
app.post('/getpages',page.getpages); /// breaks REST ??
app.get('/editpage*',page.editpage);
app.post('/saveblocks',page.saveblocks);
app.post('/uploadmedia*',page.uploadmedia); /// breaks REST ?? uses get query with post method
app.get('/profile',page.profile);
app.post('/saveprofile',page.saveprofile);
app.post('/getprofiledata',page.getprofiledata);
app.post('/revert',page.revert);

app.all('*',page.notfound);

/* activate the server */
app.listen(port);

// <<<fold>>>
