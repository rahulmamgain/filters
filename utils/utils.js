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

function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for') || req.connection.remoteAddress; 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
}

exports.throwError = throwError;
exports.sortRulesByPriority = sortRulesByPriority;
exports.getParams = getParams;
exports.getClientIp = getClientIp;