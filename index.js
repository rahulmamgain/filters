import { config as pathConfig } from "./rules/path.validator";
import { config as tokenConfig } from "./rules/token.validator";
import { config as limitConfig } from "./rules/rate-limitter";

var RulesConfig = {
	"path": pathConfig,
	"token": tokenConfig,
	"limit": limitConfig
};

function getParams(query) {
	  if (!query) {
	    return { };
	  }
	  return (/^[?#]/.test(query) ? query.slice(1) : query)
	    .split('&')
	    .reduce((params, param) => {
	      let [ key, value ] = param.split('=');
	      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
	      return params;
	    }, { });
}

function sortRulesByPriority(rules) {
  rules.sort((r1, r2) => {
    return r2.priority - r1.priority;
  })

  return rules;
}

function throwError() {
	console.log("Error thrown");
}

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







