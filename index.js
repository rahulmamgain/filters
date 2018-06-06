import { config as pathConfig } from "./rules/path.validator";
var RulesConfig = {
	"path": pathConfig,
	
	"token": {
		type: "token",
		priority: 80,
		handler: function(req) {
			return (req.headers["Authorization"]? true: false);
		}
		
	},
	
	"limit": {
		type: "limit",
		config: {
			"search": 10000,
			"entitlements": 1000
		},
		priority: 60,
		handler: function(req) {
			var currentUrl = req.url;
			var keys = config.keys();
			var isError = false;
			for(var i =0, wurl; i < keys.length; i++) {
				wurl = keys[i];
				if (currentUrl.indexof(wurl) > -1) {
					var params = getParams(currentUrl.split("?")[1]);
					
					if (params && params.length) {
						isError = params['limit'] > config[wurl];
					}
				}
				
				return isError;
			}
		}
		
	}
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







