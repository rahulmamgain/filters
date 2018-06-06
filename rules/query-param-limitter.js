var util = require("../utils/utils");

exports.config = {
  type: "queryLimit",
  config: {
    "https://api.taylorandfrancis.com/v2/auth/user/auth/authorize": 10000
  },
  priority: 60,
  execute: function (req) {
    return new Promise((resolve, reject) => {

      console.log("RULE::queryLimit Execute");

      var currentUrl = req.url;
      var keys = Object.keys(this.config);
      var isError = false;

      for (var i = 0, url; i < keys.length; i++) {
        url = keys[i];

        if (currentUrl.indexOf(url) > -1) {
          var params = util.getParams(currentUrl.split("?")[1]);
          var qpLimit = '';

          console.log("params::", params);

          if (req.method === 'GET' && params && params['limit']) {
            // For GOT requests with limit as query param

            qpLimit = parseInt(params['limit'], 10);

            console.log("qpLimit::", qpLimit);
            console.log("configLimit::", this.config[url]);

            if (qpLimit && Number.isInteger(qpLimit)) {
              isError = qpLimit > this.config[url];
            }

          } else if (req.method === "POST" && req.body['limit']) {
            // For POST methods with request body containing limit param

            qpLimit = req.body['limit'];

            console.log("qpLimit::", qpLimit);
            console.log("configLimit::", this.config[url]);

            if (qpLimit && Number.isInteger(qpLimit)) {
              isError = qpLimit > this.config[url];
            }
          } else {
            // Required value limit is not present

            isError = true;
          }
        }

        console.log("RULE::queryLimit Execute. failed::", isError);

        if (isError) {
          break;
        }
      }

      if(isError) {
        reject();
      } else {
        resolve();
      }
    })
  }

};

