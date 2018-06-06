var RedisClient = require('redis');

exports.config = {
  type: "rateLimit",
  priority: 70,
  execute
};

function execute(request) {
  console.log("RULE::rateLimit Execute.");
  //TODO: these two constants should come from Redis. Add the get requests to the multi() call.
  const DEFAULT_MAX_RATE = 3; //Max number of queries per time unit
  const DEFAULT_TIME_WINDOW = 1; //make it 1 to enforce a rate per second, 60 for per minute, etc

  //TODO: is there a way to reuse the Redis connection to save at least one network round-trip? Moving the createClient() outside of the handler and not 
  //dropping the connection stops the handler from returning (event loop is not empty?) making the Lambda time out after 3 secs. Different Redis library maybe?

  var start = new Date().getTime();
  const token = headers.authorization[0].value;

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
    clearTimeout(timeout);
    callback(null, request);
  });

  redis.on("ready", function () {
    //console.log("DEBUG: Redis ready at: " + (new Date().getTime() - start) + "ms");
    const count_key = "count:" + token;
    var time_window = DEFAULT_TIME_WINDOW;
    var max_rate = DEFAULT_MAX_RATE;

    multi.get("config:max_rate", function (err, rate) { if (rate != null) { max_rate = rate; } });
    multi.get("config:time_window", function (err, wind) { if (wind != null) { time_window = wind; } });
    multi.incr(count_key);

    //console.log("DEBUG: Before queries: " + (new Date().getTime() - start) + "ms");
    multi.exec(function (err, replies) {
      console.log("DEBUG: Queries return at: " + (new Date().getTime() - start) + "ms");
      var count = replies[2];

      if (replies[0]) { max_rate = replies[0]; }
      if (replies[1]) { time_window = replies[1]; }
      if (count == 1) {
        //console.log("DEBUG: Before setting new key with expiry: " + (new Date().getTime() - start) + "ms");
        redis.expire(count_key, time_window);
        //console.log("DEBUG: After setting new key with expiry: " + (new Date().getTime() - start) + "ms");
      }
      redis.quit();

      clearTimeout(timeout);
      //console.log("DEBUG: About to return control at: " + (new Date().getTime() - start) + "ms");
      if (count > max_rate) {
        callback(null, {
          status: '429',
          statusDescription: 'Rate limit exceeded',
        });
      }
      else {
        callback(null, request);
      }
    });
  });

}

function reconnect_strategy(options) {
  return null;
}