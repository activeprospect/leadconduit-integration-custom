const _ = require('lodash');
const helpers = require('./helpers');
const response = require('./response');
const validate = require('./validate');
const normalize = require('./normalize');
const variables = require('./variables');
const headers = require('./headers');
const compact = require('./compact');



//
// Request Function --------------------------------------------------------
//

const request = function(vars) {
  let json = normalize(vars.json_property, _.result(vars, 'send_ascii.valueOf', false)) || {};

  // test whether the mappings indicate that a root array is being requested
  const keys = Object.keys(json);
  const rootArray = _.every(keys, key => key.match(/^\d+$/));

  if (rootArray) {
    const array = [];
    for (let key in json) {
      const value = json[key];
      array[key] = value;
    }
    json = array;
  }

  // compact all arrays
  json = compact(json);

  let body = JSON.stringify(json);

  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
  };

  if (vars.credential) {
    defaultHeaders['Authorization'] = helpers.encodeBasicAuth(vars.credential.username, vars.credential.password);
  }

  if (vars.basic_username && vars.basic_password) {
    defaultHeaders['Authorization'] = helpers.encodeBasicAuth(vars.basic_username, vars.basic_password);
  }

  if (vars.json_parameter) {
    body = (! _.isEmpty(JSON.parse(body)) ) ? body : undefined;
    body = helpers.parameterize(vars.json_parameter, body, vars.extra_parameter, vars.nested_extra_parameter);
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  defaultHeaders['Content-Length'] = Buffer.byteLength(body);

  return {
    url: vars.url,
    method: _.result(vars, 'method.toUpperCase', 'POST'),
    headers: _.merge(defaultHeaders, headers(vars.header)),
    followAllRedirects: !!vars.follow_redirects,
    body
  };
};



//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'credential_id', type: 'credential', required: false },
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'method', description: 'HTTP method (POST, PUT, or DELETE)', type: 'string', required: true },
  { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false },
  { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false },
  { name: 'json_property.*', description: 'JSON property in dot notation', type: 'wildcard', required: false },
  { name: 'json_parameter', description: 'To "stuff" the JSON into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false },
  { name: 'nested_extra_parameter.*', description: 'Extra JSON object that is included in the url encoded request body. Only added when the "json_parameter" mapping is enabled.', type: 'wildcard', required: false },
  { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when JSON Parameter is set', type: 'wildcard', required: false }
].concat(variables);



//
// Exports ----------------------------------------------------------------
//

module.exports = {
  request,
  response,
  validate(vars) {
    return validate.url(vars) ||
           validate.method(vars, ['POST', 'PUT', 'DELETE']) ||
           validate.outcome(vars) ||
           validate.headers(vars, 'json') ||
           undefined;
  }
};
