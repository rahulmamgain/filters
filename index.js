var path = require("./rules/path.validator");
var token = require("./rules/token.validator");
var limit = require("./rules/rate-limitter");
var util = require("./utils/utils");

var errorObj;

var RulesConfig = {
	"path": path.config,
	"token": token.config,
	"limit": limit.config
};

function execute(event, context, callback) {
  const req = event.Records[0].cf.request;
  var rulesToApply = [];
  var isErrorRequest = false;
  errorObj = {
    status: '',
    message: ''
  };

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
          setErrorFields(400, "JWT Token not present")
          rulesToApply = [];
          isErrorRequest = true;
				}
				
				break;
				
			case "limit": 
				console.log("Query Rule limit executed");
				
				if (result) {
          setErrorFields(400, "Query params exceeded")
          rulesToApply = [];
          isErrorRequest = true;
				}
				
				break;
				
			default:
				console.log("Alarm! Unknown rule got executed!");
		}
  }
  
  if (isErrorRequest) {
    callback(null, errorObj);
  } else {
    callback(null, req);
  }
}

function setErrorFields(status, message) {
  errorObj.status = status;
  errorObj.message = message;
}

(function main() {
  var mockRequest = {
    url: "https://api.taylorandfrancis.com/v2/auth/user/auth/dfgsd?limit=11000",
    method: "GET",
    headers: {
      Authorization: "dsfgdsfg"
    }
  };

  var mockEvent = {
    Records: [{
      cf: {
        request: mockRequest
      }
    }]
  }

  let mockCallback = (param) => { 
    console.log(param);
  }

  execute(mockEvent, {}, mockCallback);

})();
