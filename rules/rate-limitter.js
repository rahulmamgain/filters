var util = require("../utils/utils");

exports.config = {
  type: "limit",
  config: {
    "search": 10000,
    "entitlements": 1000
  },
  priority: 60,
  handler: function (req) {
    var currentUrl = req.url;
    var keys = config.keys();
    var isError = false;
    for (var i = 0, wurl; i < keys.length; i++) {
      wurl = keys[i];
      if (currentUrl.indexof(wurl) > -1) {
        var params = util.getParams(currentUrl.split("?")[1]);

        if (params && params.length) {
          isError = params['limit'] > config[wurl];
        }
      }

      return isError;
    }
  }

};

