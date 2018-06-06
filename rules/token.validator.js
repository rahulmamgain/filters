exports.config = {
  type: "token",
  priority: 80,
  execute: function (req) {
    return new Promise((resolve, reject) => {

      console.log("RULE::token Execute.");

      var isTokenPresent = (req.headers["Authorization"] ? true : false);

      console.log("RULE::token Execute. token::", isTokenPresent);

      if(isTokenPresent) {
        resolve();
      } else {
        reject();
      }
    });
  }
};
