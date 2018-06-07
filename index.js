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

exports.handler = (event, context, callback) => {
	const request = event.Records[0].cf.request;

	var rulesToApply = [];

	var isErrorRequest = false;

	errorObj = {
		status : '',
		message : ''
	};

	var timeout = setTimeout(function() {
		callback(null, request);
		context.done();
	}, 1000);

	var result = RulesConfig["path"].execute(request);
	if (result === "INCLUDED") {
		rulesToApply.push(RulesConfig["queryLimit"]);
		rulesToApply.push(RulesConfig["token"]);
		rulesToApply.push(RulesConfig["rateLimit"]);
	} else if (result === "EXCLUDED") {
		rulesToApply.push(RulesConfig["queryLimit"]);
		rulesToApply.push(RulesConfig["rateLimit"]);
	}

	rulesToApply = util.sortRulesByPriority(rulesToApply);
	var ruleFunctions = convertRulesToFunctionsAndBindRequest(rulesToApply, request);

	promiseSerialify(ruleFunctions)
		.then(() => {
			console.log('All functions executed successfully');
			clearTimeout(timeout);
			rulesToApply = [];
			callback(null, request);
		})
		.catch((err) => {
			console.log('Failure');
			clearTimeout(timeout);
			rulesToApply = [];
			callback(null, err);
		});
}

function convertRulesToFunctionsAndBindRequest(rulesToApply, request) {
	var funcs = [];
	rulesToApply.forEach((rule) => {
		funcs.push(rule.execute.bind(rule, request));
	})

	return funcs;
}

