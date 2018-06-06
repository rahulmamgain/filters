var RulesConfig = {
	"path": {
		type: "path",
		priority: 100,
		inclusion: [{
			  path: "https://api.taylorandfrancis.com/v2/auth/user/auth/authorize",
			  methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/self",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/org",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/geolocation/countries/all",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/signUp",
        methods: ["POST"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/resendVerifyRegistrationMail",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/login",
        methods: ["POST"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/forgotpassword",
        methods: ["GET", "POST", "PUT"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/verifySignup",
        methods: ["POST"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/logout",
        methods: ["POST"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/orcid",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/orcid/callback",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/saml/",
        methods: ["GET"]
      },
      {
        path: "https://api.taylorandfrancis.com/v2/auth/user/auth/saml/callback",
        methods: ["POST"]
      }
    ],
		exclusion: [{
		  path: "https://api.taylorandfrancis.com/v2/auth/user/auth/authorize",
		  methods: ["GET"]
		}],
		handler: function(req) {
			var currentUrl = req.url;
			var method = req.method;
			var path = "INVALID";
			
			var isExclusionURL = this.exclusion.some((item) => {
				var wurl = item.path;
				return (currentUrl.indexOf(wurl) > -1 && item.methods.includes(method));
			});
			
			var isInclusionURL = false;
			
			if (isExclusionURL) {
				path = "EXCLUDED"; 
			} else {
				isInclusionURL  = this.inclusion.some((item) => {
					var wurl = item.path;
					return (currentUrl.indexOf(wurl) > -1 && item.methods.includes(method));
				});
				
				if (isInclusionURL) {
					path = "INCLUDED"; 
				}
			}
			
			return path;									
		}		
	},
	
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
	var result = rules[0].handler(req);
	
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
			if (result) {
				
			}
			break;
		case "limit": 
			console.log("Rule limit executed");
			break;
		default:
			console.log("Unknown!");
			
	}
	
}







