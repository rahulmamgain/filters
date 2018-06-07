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

var isErrorRequest, errorObj;

function execute(event, context, callback) {
	const request = event.Records[0].cf.request;

	var rulesToApply = [];

	isErrorRequest = false;

	errorObj = {
		status : '',
		message : ''
	};

	var timeout = setTimeout(function() {
		callback(null, request);
	 	// context.done();
	}, 1000);

	rulesToApply.push(RulesConfig["path"]);

	recursiveExec(rulesToApply, request, context, callback, timeout);
	
}

function recursiveExec(rulesToApply, request, context, callback, timeout) {
	
	if (rulesToApply && rulesToApply.length === 0) {
		clearTimeout(timeout);
		
		if (isErrorRequest) {
			callback(null, errorObj);
		} else {
			callback(null, request);
		}
		
		return;
	}

	// Sort the rules to apply based on priority
	rulesToApply = util.sortRulesByPriority(rulesToApply);

	console.log("Before rules.length::", rulesToApply.length);

	// Extract highest priority rules for execution
	var rule = rulesToApply.shift();

	console.log("After rules.length::", rulesToApply.length);

	// Execute rule
	var resultPromise = rule.execute(request);
	
	resultPromise.then((result) => {
		// Handle results after the rules execution
		switch (rule['type']) {

			case "path":
				console.log("Rule path executed");
	
				if (result === "INCLUDED") {
					// if URL fall under inclusion list check for token and limit rules too
	
					rulesToApply.push(RulesConfig["token"]);
					rulesToApply.push(RulesConfig["queryLimit"]);
					rulesToApply.push(RulesConfig["rateLimit"]);
				} else if (result === "EXCLUDED") {
					rulesToApply.push(RulesConfig["queryLimit"]);
					rulesToApply.push(RulesConfig["rateLimit"]);
				}
	
				break;
	
			case "token":
				console.log("Rule token executed");
	
				if (!result) {
					setErrorFields(400, "JWT Token not present")
					rulesToApply = [];
					isErrorRequest = true;
				}
	
				break;
	
			case "queryLimit":
				console.log("Query Rule queryLimit executed");
	
				if (result) {
					setErrorFields(400, "Query params exceeded")
					rulesToApply = [];
					isErrorRequest = true;
				}
	
				break;
	
			case "rateLimit":
				if (result && result.error) {
					setErrorFields(429, "Rate limit exceeded")
					rulesToApply = [];
					isErrorRequest = true;
				}
			default:
				console.log("Alarm! Unknown rule got executed!");
		}
		
		recursiveExec(rulesToApply, request, context, callback, timeout);
		
	}).catch((error) => {
		console.log('error');
		callback(null, request);
	});
}

function setErrorFields(status, message) {
	errorObj.status = status;
	errorObj.message = message;
}

(function main() {
	var mockRequest = {
		url : "https://api.taylorandfrancis.com/v2/auth/user/auth/authorize?limit=10000",
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