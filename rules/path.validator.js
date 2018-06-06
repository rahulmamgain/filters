var exclusionUrls =
  [
    {
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
  ];

var inclusionUrls = [{
  path: "https://api.taylorandfrancis.com/v2/auth/user/auth/dfgsd",
  methods: ["GET"]
}];

function execute(req) {
  return new Promise((resolve, reject) => {

    console.log("RULE::path Execute");

    var currentUrl = req.url;
    var method = req.method;
    var path = "INVALID";
    var isInclusionURL = false;

    console.log("currentUrl::", currentUrl);
    console.log("method::", method);

    var isExclusionURL = this.exclusionUrls.some((item) => {
      var wurl = item.path;
      return ((currentUrl.indexOf(wurl) > -1) && item.methods.includes(method));
    });

    if (isExclusionURL) {
      // If URL falls in exclusion list

      path = "EXCLUDED";
    } else {
      isInclusionURL = this.inclusionUrls.some((item) => {
        var wurl = item.path;
        return (currentUrl.indexOf(wurl) > -1 && item.methods.includes(method));
      });

      if (isInclusionURL) {
        // If URL falls in inclusion list

        path = "INCLUDED";
      }
    }

    console.log("RULE::path Execute, path::", path);

    resolve(path);
  });
}

exports.config = {
  type: "path",
  priority: 100,
  inclusionUrls,
  exclusionUrls,
  execute
};
