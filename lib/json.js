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

  const dotNotationVars = Object.keys(vars).filter(varName => varName.includes('nested_value'));
  if (dotNotationVars.length) {
    for (elem of dotNotationVars) {
      // elem will be a string like 'nested_value.set.this.path'
      // we don't want to include 'nested_value' in the path so we will slice the string
      let path = elem.slice(13);
      _.set(json, path, vars[elem]);
    }
  }

  let body = JSON.stringify(json);

  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
  };

  if (vars.basic_username && vars.basic_password) {
    defaultHeaders['Authorization'] = helpers.encodeBasicAuth(vars.basic_username, vars.basic_password);
  }

  if (vars.json_parameter) {
    body = helpers.parameterize(vars.json_parameter, body, vars.extra_parameter);
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }


  defaultHeaders['Content-Length'] = Buffer.byteLength(body);

  return {
    url: vars.url,
    method: _.result(vars, 'method.toUpperCase', 'POST'),
    headers: _.merge(defaultHeaders, headers(vars.header)),
    body
  };
};



//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'method', description: 'HTTP method (POST, PUT, or DELETE)', type: 'string', required: true },
  { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false },
  { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false },
  { name: 'json_property.*', description: 'JSON property in dot notation', type: 'wildcard', required: false },
  { name: 'json_parameter', description: 'To "stuff" the JSON into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false },
  { name: 'nested_value.*', description: 'Takes a value and maps it to the body in the specified dot notated path', type: 'string', examples: ['nested_value.preferences.isConsentGranted']},
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
