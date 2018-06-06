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

exports.throwError = throwError;
exports.sortRulesByPriority = sortRulesByPriority;
exports.getParams = getParams;