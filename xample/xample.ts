import * as express from "express";
import * as session from "express-session";
import * as mysql from "mysql";
import { slack, SlackMessage } from "./utilities";
import setupRoutes from "./routes";
const busboy = require("connect-busboy"); // TODO
const sqlsession = require("express-mysql-session");

/*
	Section: Xample

	This is the server for Xample
*/

/*
	Section: Command Line
	This section processes command line arguments
*/

/* grab command line arguments, 0 -> node, 1 -> path to .js, 2+ -> actual arguments */
let port;
let host;

switch (process.argv.length) {
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
if (port > 65535 || port < 1) {
    console.log("Invalid port number. Port argument must be between 1 & 65535");
    process.exit();
}

/* check that valid host option was given */
let root;
switch (host) {
    case "local":
        root = "http://localhost:" + port + "/";
        break;
    case "remote":
        root = "http://abaganon.com/xample/"; // TODO
        break;
    default:
        console.log("Incorrect value for arg 1. Usage: node xample.js [local|remote] [port]");
        process.exit();
}

/*
	Section: Modules

	These are the modules xample uses

	page - imports the functions that handle xample url requests
	express - used to start a server and page routing
	busboy - used to parse media data (file uploads)
	session - used with express to add sessions for users
*/


/*
	MySQLStore - used for persistent sessions
*/
const MySQLStore = sqlsession(session);


/*
	Section: Prototypes
	These are additions or changes to js prototypes
*/

/* express requests will have root which is the http path to this server */
(<any>express).request.root = root;

/*
	Section: Server Exit
	These functions handle uncaught errors and program exit procedure
*/

/* prevents node from exiting on error */
process.on("uncaughtException", err => {
    console.log("666 " + err);

    slack(err);
});

/* ensures stdin continues after uncaught exception */
process.stdin.resume();

/* calls exitHandler() on SIGINT, ctrl^c */
process.on("SIGINT", () => {
    console.log("\nClean up routine complete. Xample app terminated.");
    process.exit();
});

/*
	Section: Create Server
	These functions create a server, set it up, and route url addresses. An asterisks indicates that a get link may follow.
*/

/* create express server */
const app = express();

/* remove from http headers */
app.disable("x-powered-by");

/* set up static file routes */
app.use(express.static("../public_html"));

/* set up sessions */
/// todo: this is a hack, sessionStore needs to work on remote & local.
if (host === "local") {
    app.use(session({
        // TODO key: "xsessionkey",
        secret: "KZtX0C0qlhvi)d",
        resave: false,
        saveUninitialized: false
    }));
} else {
    app.use(session({
        // TODO key: "xsessionkey",
        secret: "KZtX0C0qlhvi)d",
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore({
            host: "localhost",
            user: "nodesql",
            password: "Vup}Ur34",
            database: "xsessionstore"
        })
    }));
}

/* set up busboy */
app.use(busboy());

global["GLOBALreroute"] = "../public_html/"; // TODO global variables

global["pool"] = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "nodesql",
    password: "Vup}Ur34",
    database: "xample"
});

global["stats"] = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "nodesql",
    password: "Vup}Ur34",
    database: "xanalytics"
});

/* routes */
setupRoutes(app, pool, stats);

/* activate the server */
app.listen(port);
