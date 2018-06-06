import { config as pathConfig } from "./rules/path.validator";
import { config as tokenConfig } from "./rules/token.validator";
import { config as limitConfig } from "./rules/rate-limitter";
import { config as limitConfig } from "./rules/rate-limitter";
import { getParams, sortRulesByPriority, throwError } from "./utils/utils";

var RulesConfig = {
	"path": pathConfig,
	"token": tokenConfig,
	"limit": limitConfig
};

function execute(req) {
	var rules = [];
	rules.push(RulesConfig["path"]);

	while(rules.length > 0) {
		rules = sortRulesByPriority(rules);
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
					throwError();
				}
				break;
			case "limit": 
				console.log("Rule limit executed");
				if (result) {
					throwError();
				}
				break;
			default:
				console.log("Unknown!");
		}
		
	}
}

var req =  {};
execute(req);







