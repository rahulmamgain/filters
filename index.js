var RulesConfig = {
	Path: {
		priority: 100,
		inclusion: [],
		exclusion: [],
		handler: function(req) {
			var currentUrl = req.url;
			var path = "INVALID";
			
			var isExclusionURL = this.exclusion.some((wurl) => {
				return currentUrl.indexof(wurl) > -1;
			});
			
			var isInclusionURL = false;
			
			if (isExclusionURL) {
				path = "EXCLUDED"; 
			} else {
				isInclusionURL  = this.inclusion.some((wurl) => {
					return currentUrl.indexof(wurl) > -1;
				});
				
				if (isInclusionURL) {
					path = "INCLUDED"; 
				}
			}
			
			return path;									
		}		
	},
	
	Token: {
		priority: 80,
		handler: function(req) {
			return (req.header.token? true: false);
		}
		
	},
	
	limit: {
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
    return r1.priority - r2.priority;
  })

  return rules.slice();
}

var rules = [];
rules.push(RulesConfig.Path);







