const _ = require('lodash');
const flat = require('flat');
const normalize = require('./normalize');
const querystring = require('querystring');
const regexParser = require('regex-parser');

const inverseOutcome = function(outcome) {
  switch (outcome) {
    case 'success': return 'failure';
    case 'failure': return 'success';
    default: return 'success';
  }
};

const ensureArray = function(val = []) {
  if (!_.isArray(val)) { val = [val]; }
  return val;
};

const encodeBasicAuth = function(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

const toRegex = function(expression) {
  expression = expression != null ? expression.trim().toLowerCase() : undefined;
  if (!expression) { return regexParser('.*'); }
  try {
    return regexParser(expression);
  } catch (err) {
    return null;
  }
};

// stuff formatted body (e.g., XML or JSON) into a named parameter, along with any "extra" parameters
// extraNestedParams is similar to extraParams, except we do not want to flatten them
const parameterize = function(param, body, extraParams, extraNestedParams = {}) {
  const b = {};
  if (body) b[param] = body;
  if (!_.isEmpty(extraNestedParams)) {
     for (key of Object.keys(extraNestedParams)) {
      b[key] = JSON.stringify(extraNestedParams[key]);
    }
  }
  if (extraParams) {
    const params = flat.flatten(normalize(extraParams), {safe:true});
    return querystring.stringify(_.merge(b,params));
  } else {
    return querystring.stringify(b);
  }
};

module.exports = {
  inverseOutcome,
  ensureArray,
  encodeBasicAuth,
  toRegex,
  parameterize
}
