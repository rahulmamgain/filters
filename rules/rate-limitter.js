var util = require("../utils/utils");

exports.config = {
  type: "limit",
  config: {
    "https://api.taylorandfrancis.com/v2/auth/user/auth/dfgsd": 10000
  },
  priority: 60,
  execute: function (req) {
	console.log("RULE::limit Execute");
	
    var currentUrl = req.url;
    var keys = Object.keys(this.config);
    var isError = false;
    
    for (var i = 0, wurl; i < keys.length; i++) {
      wurl = keys[i];
    
      if (currentUrl.indexOf(wurl) > -1) {
        var params = util.getParams(currentUrl.split("?")[1]);
        var qpLimit = '';
        
        console.log("params::", params);
              
        if (req.method === 'GET' && params && params['limit']) {
          // For GOT requests with limit as query param
        	
          qpLimit = parseInt(params['limit'], 10);
          
          console.log("qpLimit::", qpLimit);
          console.log("configLimit::", this.config[wurl]);
          
          if (qpLimit && Number.isInteger(qpLimit)) {
        	  isError = qpLimit > this.config[wurl];
          }
          
        } else if (req.method === "POST" && req.body['limit']) {
        	// For POST methods with request body containing limit param
        	
        	qpLimit = req.body['limit'];
        	
        	console.log("qpLimit::", qpLimit);
            console.log("configLimit::", this.config[wurl]);
        	
            if (qpLimit && Number.isInteger(qpLimit)) {
          	  isError = qpLimit > this.config[wurl];
            }
        } else {
        	// Required value limit is not present
        	
        	isError = true;
        }
      }
      
      console.log("RULE::limit Execute. failed::", isError);
      
      return isError;
    }
  }

};

