/* eslint-env node, es6 */
/* eslint no-console: "off" */

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

/* check that valid host option was given */
switch(host) {
	case "local":
		break;
	case "remote":
		break;
	default:
		console.log("Incorrect value for arg 1. Usage: node xample.js [local|remote] [port] [processes]");
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
	var server = require('./server.js')(host,port);
	if(server === 'err') {
		process.exit();
	}
}

// <<<fold>>>
