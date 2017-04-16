/* eslint-env node, es6 */
/*
	Title: Message
	Route for sending slack messages.
*/

var analytics = require('./../analytics.js');
var queryUserDB = require('./../queryuserdb.js');

function slack(message,channel) {
	var promise = new Promise(function(resolve,reject) {
		var request = require('request');

		var postData = {};
		postData.username = "tutorial-form";
		postData.icon_emoji = ":e-mail:";
		if(channel.indexOf("#") > -1) {
			postData.channel = channel;
		} else {
			postData.channel = "#" + channel;
		}
		postData.text = message;

		var option = {
			url:   'https://hooks.slack.com/services/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',
			body:  JSON.stringify(postData)
		};

		request.post(option,function(err,res,body) {
			if(body === "ok" && !err) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});

	return promise;
}

function sendCaptcha(captcha,ip) {
	var promise = new Promise(function(resolve,reject) {
		var request = require('request');

		var postData = {
			secret:'6LdQNx0UAAAAAMFrspPaBaPZVrgYYxwTKPATRHBI',
			response:captcha,
			remoteip:ip
		};

		var option = {
			url:   'https://www.google.com/recaptcha/api/siteverify',
			body:  JSON.stringify(postData)
		};

		request.post(option,function(err,res,body) {
			if(err) {
				resolve(false);
			} else if(res !== null && res) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});

	return promise;
}

/*
	Function: message

	Ajax, handles the message routine.

	Parameters:

		request - http request
		response - http response

	Returns:

		nothing - *
*/
exports.message = function(request,response) {
	var __function = "message";

	var qs = require('querystring');

	/* create response object */
	var result = {msg:"",data:{}};

	var body = '';

    /* when the request gets data, append it to the body string */
    request.on('data',function(data) {
        body += data;

        /* prevent overload attacks */
        if (body.length > 1e6) {
			request.connection.destroy();
			var errmsg = {message:"Overload Attack!"};
			analytics.journal(true,199,errmsg,0,global.__stack[1].getLineNumber(),__function,__filename);
		}
    });

    /* when the request ends, parse the POST data, & process the sql queries */
    request.on('end',function() {

		var POST = qs.parse(body);

		/* change info as needed */
		var formid = POST.formid;

		if(formid === 'tutorial') {
			var review = "REVIEW: " + POST.review;
			var profession = " PROFESSION: " + POST.profession;
			var email = " EMAIL: " + POST.email;
			var comment = " COMMENT: " + POST.comment;
			var captcha = POST['g-recaptcha-response'];

			var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

			var fullmessage = review + profession + email + " IP: " + ip + comment;

			if(!captcha) {
				result.msg = 'fail';
				response.end(JSON.stringify(result));
				return;
			}

			sendCaptcha(captcha,ip).then(function(data) {
				if(data) {
					slack(fullmessage,'wisepool').then(function(data) {
						if(data) {
							result.msg = 'sent';
							response.end(JSON.stringify(result));
							analytics.journal(false,0,"",0,analytics.__line,__function,__filename);
						} else {
							result.msg = 'fail';
							response.end(JSON.stringify(result));
						}
					});
				} else {
					result.msg = 'fail';
					response.end(JSON.stringify(result));
				}
			});
		} else {
			result.msg = 'fail';
			response.end(JSON.stringify(result));
		}
	});
};
