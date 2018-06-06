var RedisClient = require('redis');
var util = require("../utils/utils");

var urlConfig = [{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/authorize',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/signUp',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/resendVerifyRegistrationMail',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/login',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/forgotpassword',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/verifySignup',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v2/auth/user/auth/logout',
	token: false,
	clientIP: true
},{
	url: 'api.taylorandfrancis.com/v1/search',
	token: false,
	clientIP: false
}];

exports.config = {
  type: "rateLimit",
  priority: 40,
  config: urlConfig,
  execute
};

function execute(request) {
  return new Promise((resolve, reject) => {
	  console.log("RULE::rateLimit Execute.");
	  
	  var currentUrl = request.url;
	  var currentConfig;
	  var isRateLimiterApplied = false;
	  
	  for (var i=0; i < this.config.length; i++) {
		  currentConfig = this.config[i];
		  if (currentUrl.indexOf(currentConfig['url']) !== -1) {
			  isRateLimiterApplied = true;
			  break;
		  }
	  }
	  
	  if (!isRateLimiterApplied) {
		  resolve();
	  } else {
		//TODO: these two constants should come from Redis. Add the get requests to the multi() call.
		  const DEFAULT_MAX_RATE = 3; //Max number of queries per time unit
		  const DEFAULT_TIME_WINDOW = 1; //make it 1 to enforce a rate per second, 60 for per minute, etc

		  //TODO: is there a way to reuse the Redis connection to save at least one network round-trip? Moving the createClient() outside of the handler and not 
		  //dropping the connection stops the handler from returning (event loop is not empty?) making the Lambda time out after 3 secs. Different Redis library maybe?

		  var start = new Date().getTime();
		  //const token = headers.authorization[0].value;

		  //This URL is mapped to a Route53 latency-based host name, but can be any Redis server
		  //the retry strategy is: connect immediately or die
		  var redis = RedisClient.createClient(
		    process.env.REDIS_PORT,
		    process.env.REDIS_HOST,
		    { "password": process.env.REDIS_PASS, "retry_strategy": function (options) { return null; } }
		  );

		  //console.log("DEBUG: After connection: " + (new Date().getTime() - start) + "ms");
		  //TODO: if connection to Redis fails, pass on the request as if it was successful
		  multi = redis.multi();

		  redis.on("error", function () {
			  resolve();
		  });

		  redis.on("ready", function () {
		    //console.log("DEBUG: Redis ready at: " + (new Date().getTime() - start) + "ms");

			
		    // const count_key = "count:" + token;
			var count_key = currentConfig['url'] + ":count:";
			
			if (currentConfig['token']) {
				const headers = request.headers;
			    if (headers.authorization) {
			    	count_key += headers.authorization[0].value;
			    }
				
			} else if (currentConfig['clientIP']){
				count_key += util.getClientIp(request);
			}
			
		    var time_window = DEFAULT_TIME_WINDOW;
		    var max_rate = DEFAULT_MAX_RATE;
		    
		    multi.get(currentConfig['url'], function (err, remoteConfig) { 
		    	console.log("Multi.get callback executed");
		    	if (remoteConfig != null) { 
		    		remoteConfig = JSON.parse(remoteConfig);
		    		time_window = remoteConfig['timeWindow'];
		    		max_rate = remoteConfig['requestCount'];
		    	} 
		    });
	        
	        multi.incr(count_key);
		    
		    console.log("DEBUG: Before queries: " + (new Date().getTime() - start) + "ms");
		    multi.exec(function (err, replies) {
		      console.log("DEBUG: Queries return at: " + (new Date().getTime() - start) + "ms");
		      var count = replies[1];

		      if (replies[0]) { 
		    	  var remoteConfig = replies[0]; 
		    	  if (remoteConfig != null) { 
		    		remoteConfig = JSON.parse(remoteConfig);
		    		time_window = remoteConfig['timeWindow'];
		    		max_rate = remoteConfig['requestCount'];
		    	  } 
		      }
		      if (count == 1) {
		        //console.log("DEBUG: Before setting new key with expiry: " + (new Date().getTime() - start) + "ms");
		        redis.expire(count_key, time_window);
		        //console.log("DEBUG: After setting new key with expiry: " + (new Date().getTime() - start) + "ms");
		      }
		      redis.quit();

		      //console.log("DEBUG: About to return control at: " + (new Date().getTime() - start) + "ms");
		      if (count > max_rate) {
		        reject({
			          status: '429',
			          statusDescription: 'Rate limit exceeded',
			    });
		      }
		      else {
		    	  resolve();
		      }
		    });
		  });
	  }
	  
	  
  });

}

function reconnect_strategy(options) {
  return null;
}