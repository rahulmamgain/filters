var inclusionUrls =
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

var exclusionUrls = [{
  path: "https://api.taylorandfrancis.com/v2/auth/user/auth/authorize",
  methods: ["GET"]
}];

function handler(req) {
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
    isInclusionURL = this.inclusion.some((item) => {
      var wurl = item.path;
      return (currentUrl.indexOf(wurl) > -1 && item.methods.includes(method));
    });

    if (isInclusionURL) {
      path = "INCLUDED";
    }
  }

  return path;
}

export var config = {
  type: "path",
  priority: 100,
  inclusion: inclusionUrls,
  exclusion: exclusionUrls,
  handler: handler
}
