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
	var rulesToApply = [];
	rulesToApply.push(RulesConfig["path"]);

	while(rulesToApply.length > 0) {
		// Sort the rules to apply based on priority
		rulesToApply = util.sortRulesByPriority(rulesToApply);
		
		console.log("Before rules.length::", rulesToApply.length);
		
		// Extract highest priority rules for execution
		var rule = rulesToApply.shift();
		
		console.log("After rules.length::", rulesToApply.length);
		
		// Execute rule
		var result = rule.execute(req);
		
		// Handle results after the rules execution
		switch(rule['type']) {
		
			case "path":
				console.log("Rule path executed");
				
				if (result === "INCLUDED") {
					// if URL fall under inclusion list check for token and limit rules too
					
					rulesToApply.push(RulesConfig["token"]);
					rulesToApply.push(RulesConfig["limit"]);
				}
				
				break;
				
			case "token": 
				console.log("Rule token executed");
				
				if (!result) {
					rulesToApply = [];
					util.throwError();
				}
				
				break;
				
			case "limit": 
				console.log("Rule limit executed");
				
				if (result) {
					rulesToApply = [];
					util.throwError();
				}
				
				break;
				
			default:
				console.log("Alarm! Unknown rule got executed!");
		}
		
	}
}

var req =  {
  url: "https://api.taylorandfrancis.com/v2/auth/user/auth/dfgsd?limit=11000",
  method: "GET",
  headers: {
	  Authorization: "dsfgdsfg"
  }
};

execute(req);







