/* eslint-env node, es6 */
/* eslint no-console: "off" */

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
var processes;
var port;
var host;

switch(process.argv.length) {
	case 5:
		processes = Number(process.argv[4]);
		port = Number(process.argv[3]);
		host = process.argv[2];
		break;
	case 4:
		processes = 1;
		port = Number(process.argv[3]);
		host = process.argv[2];
		break;
	case 3:
		processes = 1;
		port = 2020;
		host = process.argv[2];
		break;
	default:
		console.log("Wrong number of arguments. Usage: node xample.js [local|remote] [port] [processes]");
		process.exit();
}

/* check for that valid port number was given */
if(port > 65535 || port < 1) {
	console.log("Invalid port number. Port argument must be between 1 & 65535");
	process.exit();
}

/* check for that number of processes is possible */
const numCPUs = require('os').cpus().length;
if(processes < 0 || processes > numCPUs) {
	console.log("Invalid processes number. This server can only run up to " + numCPUs + " processes.");
	process.exit();
}

/* check that valid host option was given */
var root;
switch(host) {
	case "local":
		root = "http://localhost:" + port + "/";
		break;
	case "remote":
		root = "http://wisepool.io/";
		break;
	default:
		console.log("Incorrect value for arg 1. Usage: node xample.js [local|remote] [port]");
		process.exit();
}

// <<<fold>>>

/*
	Section: Clusters
	This section generates multiple processes to handle traffic.
*/

// <<<code>>>

const cluster = require('cluster');

/* if argument was 0, run numCPUs, else run the number requested */
var stopFork = numCPUs;
if(processes > 0) {
	stopFork = processes;
}

if (cluster.isMaster) {
	/* fork workers */
	for (var i = 0; i < stopFork; i++) {
		var worker = cluster.fork();

		/* receive message from worker to master */
		worker.on('message',function(msg) {
			if(msg.code === 'fatal') {
				process.exit();
			}
		});
	}

	/* if a cluster dies, fork a new one */
	cluster.on('exit',function(worker,code,signal) {
		console.log(`Worker Died > process-pid: ${worker.process.pid}, code: ${code}, signal: ${signal}`);
		cluster.fork();
	});
} else {

// <<<fold>>>

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

/* express requests will have root which is the http path to this server */
express.request.root = root;

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
app.use(busboy());

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
	if(error) {
		console.log('xample main db connection error: ' + error);
		console.log(' ');
		connection.release();
		process.send({code:'fatal'});
	} else {
		connection.release();
	}
});

red.getConnection(function(error,connection) {
	if(error) {
		console.log('xample redundant db connection error: ' + error);
		console.log(' ');
		connection.release();
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
var assert = require('assert');

/* default mongodb url */
MongoClient.connect('mongodb://localhost:27017/xuser',function(err,db) {
	if(err) {
		console.log('xample nosql db connection error: ' + err);
		console.log(' ');
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
app.get('/editpage*',rts.editpage);
app.get('/editguide*',rts.editguide);
app.get('/explore*',rts.explore);
app.post('/getbmdata',rts.getbmdata);
app.post('/getpages*',rts.getpages);
app.post('/getprofiledata',rts.getprofiledata);
app.post('/getsubjects',rts.getsubjects);
app.get('/guide*',rts.guide);
app.get('/home',rts.home);
app.post('/journalerror',rts.journalerror);
app.post('/login',rts.login);
app.post('/logout',rts.logout);
app.get('/page*',rts.page);
app.get('/play',rts.play);
app.get('/profile',rts.profile);
app.post('/revertblocks',rts.revertblocks);
app.post('/saveblocks',rts.saveblocks);
app.post('/savepagesettings',rts.savepagesettings);
app.post('/saveprofile',rts.saveprofile);
app.post('/setbookmark',rts.setbookmark);
app.post('/signup',rts.signup);
app.post('/sv',rts.setview);
app.post('/uploadmedia*',rts.uploadmedia);
app.post('/uploadthumb*',rts.uploadthumb);

app.all('*',rts.notfound);

/* activate the server */
app.listen(port,function() {
	console.log("listening...");
});

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
	postData.channel = "#error";
	postData.text = message;

	var option = {
		url:   'https://hooks.slack.com/services/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',
		body:  JSON.stringify(postData)
	};

	request.post(option,function(err,res,body) {
		if(body === "ok" && !err) {
			console.log("Error Sent To Slack");
		}
	});
}

/* prevents node from exiting on error */
process.on('uncaughtException',function(error) {
	var datedError = new Date().toISOString().replace(/T/,' ').replace(/\..+/,'') + ' ' + error + '\n';

	/* print 666 error to console */
	console.log(datedError);

	/* slack message is disabled in testing */
	if(host === 'remote') {
		slack(datedError);
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

} // end parentheses for else{} of cluster
