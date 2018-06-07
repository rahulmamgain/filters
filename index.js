var path = require("./rules/path.validator");
var token = require("./rules/token.validator");
var queryLimit = require("./rules/query-param-limitter");
var rateLimit = require("./rules/rate-limitter");
var util = require("./utils/utils");

var RulesConfig = {
	"path" : path.config,
	"token" : token.config,
	"queryLimit" : queryLimit.config,
	"rateLimit" : rateLimit.config
};

const promiseSerialify = funcs =>
	funcs.reduce((promise, func) =>
		promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

function execute(event, context, callback) {
	const request = event.Records[0].cf.request;

	var rulesToApply = [];

	var isErrorRequest = false;

	errorObj = {
		status : '',
		message : ''
	};

	// var timeout = setTimeout(function() {
	// 	callback(null, request);
	// 	context.done();
	// }, 1000);

	var result = RulesConfig["path"].execute(request);
	if (result === "INCLUDED") {
		rulesToApply.push(RulesConfig["token"].execute.bind(RulesConfig["token"], request));
		rulesToApply.push(RulesConfig["queryLimit"].execute.bind(RulesConfig["queryLimit"], request));
	
		//rulesToApply.push(RulesConfig["rateLimit"].execute);
	} else if (result === "EXCLUDED") {
		rulesToApply.push(RulesConfig["queryLimit"].execute.bind(RulesConfig["queryLimit"], request));
		//rulesToApply.push(RulesConfig["rateLimit"].execute);
	}

	promiseSerialify(rulesToApply)
		.then(() => {
			console.log('All functions executed successfully');
		})
		.catch((err) => {
			console.log(err);
			console.log("There was a failure");
		});
}

function setErrorFields(status, message) {
	errorObj.status = status;
	errorObj.message = message;
}

(function main() {
	var mockRequest = {
		url: "https://api.taylorandfrancis.com/v2/auth/user/auth/dfgsd?limit=1000",
		method : "GET",
		headers : {
			Authorization : "dsfgdsfg"
		}
	};

	var mockEvent = {
		Records : [ {
			cf : {
				request : mockRequest
			}
		} ]
	}

	let mockCallback = (error, data) => {
		console.log(error);
		console.log(data);
	}

	execute(mockEvent, {}, mockCallback);

})();