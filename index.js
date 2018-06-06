var path = require("./rules/path.validator");
var token = require("./rules/token.validator");
var limit = require("./rules/rate-limitter");
var util = require("./utils/utils");

var RulesConfig = {
	"path": path.config,
	"token": token.config,
	"limit": limit.config
};

function execute(req) {
	var rules = [];
	rules.push(RulesConfig["path"]);

	while(rules.length > 0) {
    rules = util.sortRulesByPriority(rules);
		var rule = rules.shift();
		var result = rule.handler(req);
		
		switch(rule[type]) {
			case "path":
				console.log("Rule path executed");
				if (result === "INCLUDED") {
					rules.push(RulesConfig["token"]);
					rules.push(RulesConfig["limit"]);
				}
				break;
			case "token": 
				console.log("Rule token executed");
				if (!result) {
					util.throwError();
				}
				break;
			case "limit": 
				console.log("Rule limit executed");
				if (result) {
					util.throwError();
				}
				break;
			default:
				console.log("Unknown!");
		}
		
	}
}

var req =  {};
execute(req);







