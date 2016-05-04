/*
	template - none
	page - routines for url requests
	
	http - create a server
	express - ?
	mysql - hand mysql queries	
*/	

var page = require('./page.js');
var http = require('http');
var express = require('express');
var session = require('express-session');
var busboy = require('connect-busboy');

/* prevents node from exiting on error */
process.on('uncaughtException', function (err) {
  console.log('666 Caught Exception: ' + err);
});

/* clean up routines */
process.stdin.resume(); // so the program will not close instantly

function exitHandler() {
	page.end();
    process.exit();
}

process.on('SIGINT', exitHandler);

/* create express server */
app = express();

/* initiate server requirements */
app.use(session({
	secret: 'KZtX0C0qlhvi)d',
	resave: false,
    saveUninitialized: false
}));

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

app.all('*',page.notfound);

/* activate the server */
app.listen(2020);

