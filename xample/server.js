/* eslint-env node, es6 */
/* eslint no-console: "off" */

/*
	Section: Xample

	This is the server for Xample
*/

module.exports = function(host,port) {

/* check that valid host option was given */
var root;
var testing;
switch(host) {
	case "dev":
		root = "http://localhost:" + port + "/";
		testing = true;
		break;
	case "stage":
		root = "https://wisepool.io/";
		testing = true;
		break;
	case "prod":
		root = "https://wisepool.io/";
		testing = false;
		break;
	default:
		console.log("Incorrect value for arg 1. Usage: node xample.js [dev|stage|prod] [port]");
		return 'err';
}

/* check for that valid port number was given */
if(port > 65535 || port < 1) {
	console.log("Invalid port number. Port argument must be between 1 & 65535");
	return 'err';
}

/*
	Section: Globals & Modules

	These are the globals & modules xample uses

	require - part of node environment
	process - part of node environment
	sessionStore - allows closing session db connection on exit

	page - imports the functions that handle xample url requests
	express - used to start a server and page routing
	busboy - used to parse media data (file uploads)
	session - used with express to add sessions for users
	MySQLStore - used for persistent sessions
*/

// <<<code>>>

/* global require:true */
/* global process:true */
/* global __stack:true */

/* These set __line to return the current line number where they are used. They are used for logging errors.  */
Object.defineProperty(global,'__stack',{
get: function stacker() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_,stack) {
            return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err,stacker);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

/* for retrieving line number: global._stack[1].getLineNumber(), however required functions add to line number */
global.__stack = __stack;

var rts = require('./rts.js');
var analytics = require('./analytics.js');

/* test if any routes are broken */
for (var rt in rts) {
    if (rts.hasOwnProperty(rt)) {
        if(typeof rts[rt] === 'undefined') {
            console.log('fatal error, undefined route: ' + rt);
            process.send({code:'fatal'});
        }
    }
}

var express = require('express');
var busboy = require('connect-busboy');
var cookieParser = require('cookie-parser');

// <<<fold>>>

/*
	Section: Prototypes
	These are additions or changes to js prototypes
*/

// <<<code>>>

/* express requests will have root, http path to this server & testing, indicates if testing scripts are loaded */
express.request.root = root;
express.request.testing = testing;

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
app.use(express.static('public'));

/* set up busboy */
app.use(busboy({
	limits: {
		fileSize: 100 * 1024 * 1024
	}
}));

/* set up cookie parser */
app.use(cookieParser());

/* set up mysql */
var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit : 100,
	host     : 'localhost',
	user     : 'nodesql',
	password : 'Vup}Ur34',
	database : 'xample'
});

var red = mysql.createPool({
	connectionLimit : 100,
	host     : 'localhost',
	user     : 'nodesql',
	password : 'Vup}Ur34',
	database : 'xred'
});

/* immediately test a connection, if this fails, it's considered fatal */
pool.getConnection(function(error,connection) {
	if(error || typeof connection === 'undefined') {
		console.log('xample main db connection error: ' + error + '\n');
		if(connection !== 'undefined') {
            connection.release();
        }
		process.send({code:'fatal'});
	} else {
		connection.release();
	}
});

red.getConnection(function(error,connection) {
	if(error || typeof connection === 'undefined') {
		console.log('xample redundant db connection error: ' + error + '\n');
		if(connection !== 'undefined') {
            connection.release();
        }
		process.send({code:'fatal'});
	} else {
		connection.release();
	}
});

/* pass pool & red into request object, request.app.get("pool") & request.app.get("red") */
app.set("pool",pool);
app.set("red",red);

/* set up mongodb */
var MongoClient = require('mongodb').MongoClient;
var f = require('util').format;

var mongoUser = encodeURIComponent('nodemongo');
var mongoPassword = encodeURIComponent('9k}7{iUYJB');
var authMechanism = 'DEFAULT';

var mongourl = f('mongodb://%s:%s@localhost:27017/xuser?authMechanism=%s',mongoUser,mongoPassword,authMechanism);

/* default mongodb url */
MongoClient.connect(mongourl,function(err,db) {
	if(err) {
		console.log('xample nosql db connection error: ' + err + '\n');
		process.send({code:'fatal'});
	} else {
		/* pass userdb into request object, request.app.get("userdb") */
		app.set("userdb",db);
	}
});

/* set up redis */
var redis = require("redis");

var cachedb = redis.createClient();
cachedb.auth('a1bc60f3ee230db84e6e584700ac277f0aab5f6b3f4c7dec2173371c32ef00d4');
cachedb.select(1,function() { /* ... */ });

cachedb.on('error',function(err) {
	console.log(err);
});

/* pass pool into request object, request.app.get("pool") */
app.set("cachedb",cachedb);

/* set up session store */
var session = require('express-session');

var storename = 'redis';

var sessionStore;
switch(storename) {
	case 'mysql':
		var MySQLStore = require('express-mysql-session')(session);
		sessionStore = new MySQLStore({
			connectionLimit : 100,
			host     : 'localhost',
			user     : 'nodesql',
			password : 'Vup}Ur34',
			database : 'xsessionstore'
		});
		break;
	case 'redis':
		var clientRedisSession = redis.createClient();
		var RedisStore = require('connect-redis')(session);
		sessionStore = new RedisStore({
			host: 'localhost',
			port: 6379,
			client: clientRedisSession,
			db: 15,
			pass: 'a1bc60f3ee230db84e6e584700ac277f0aab5f6b3f4c7dec2173371c32ef00d4',
			disableTTL: true,
			prefix: 'session:'
		});
		break;
	default:
		process.send({code:'fatal'});
}

app.use(session({
	key : 'xsessionkey',
	secret: 'KZtX0C0qlhvi)d',
	resave: false,
	saveUninitialized: false,
	store: sessionStore
}));

/* set up any global variables for routes */
app.set("fileRoute",__dirname + "/public/");

/* routes */
app.get('/',rts.start);
app.post('/createpage',rts.createpage);
app.post('/deletepage',rts.deletepage);
//app.post('/deletetag',rts.deletetag);
app.get('/editpage*',rts.editpage);
//app.get('/editguide*',rts.editguide);
app.get('/embed*',rts.embed);
app.get('/explore*',rts.explore);
app.post('/getbmdata',rts.getbmdata);
app.post('/getpages*',rts.getpages);
app.post('/getprofiledata',rts.getprofiledata);
app.post('/getsubjects',rts.getsubjects);
app.post('/gettags',rts.gettags);
//app.get('/guide*',rts.guide);
app.get('/home',rts.home);
app.post('/journalerror',rts.journalerror);
app.post('/login',rts.login);
app.post('/logout',rts.logout);
app.post('/message',rts.message);
app.get('/page*',rts.page);
app.get('/play',rts.play);
app.get('/profile',rts.profile);
app.post('/revertblocks',rts.revertblocks);
app.post('/saveblocks',rts.saveblocks);
app.post('/savepagesettings',rts.savepagesettings);
app.post('/saveprofile',rts.saveprofile);
app.post('/setbookmark',rts.setbookmark);
app.post('/signup',rts.signup);
app.post('/suggesttag',rts.suggesttag);
app.post('/sv',rts.setview);
app.post('/tagcomment',rts.tagcomment);
app.get('/tagreview*',rts.tagreview);
app.post('/tagvote',rts.tagvote);
app.get('/tutorial',rts.tutorial);
app.post('/uploadmedia*',rts.uploadmedia);
app.post('/uploadthumb*',rts.uploadthumb);

app.all('*',rts.notfound);

/* activate the server */
app.listen(port,function() {
	console.log("server activated on port " + port);
});

// <<<fold>>>

/*
	Section: Server Exit
	These functions handle uncaught errors and program exit procedure
*/

// <<<code>>>

/* prevents node from exiting on error */
process.on('uncaughtException',function(error) {
	var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + ' ' + error;

	/* print 666 error to console */
	console.log(datedError);

	/* slack message is disabled in testing */
	if(host === 'remote') {
		analytics.slack(datedError);
	}

	/* write error to file, if failed, print to console */
	var fs = require('fs');
	fs.appendFile("error/666.txt",datedError,function(err) {
		if(err) {
			console.log('666: ' + datedError);
			console.log('fs: ' + err);
			console.log(' ');
			return -1;
		}
		return 0;
	});
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
	console.log('Clean up routine complete. Xample app terminated.');
    process.exit();
}

/* calls exitHandler() on SIGINT, ctrl^c */
process.on('SIGINT',exitHandler);

// <<<fold>>>

return app;

}; // end brace for module.exports
