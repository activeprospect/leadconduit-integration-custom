// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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

  let left, left1, left2;
  let json = (left = normalize(vars.json_property, (left1 = (vars.send_ascii != null ? vars.send_ascii.valueOf() : undefined)) != null ? left1 : false)) != null ? left : {};

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

  if (vars.json_parameter) {
    body = helpers.parameterize(vars.json_parameter, body, vars.extra_parameter);
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  defaultHeaders['Content-Length'] = Buffer.byteLength(body);

  return {
    url: vars.url,
    method: (left2 = (vars.method != null ? vars.method.toUpperCase() : undefined)) != null ? left2 : 'POST',
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
  { name: 'json_property.*', description: 'JSON property in dot notation', type: 'wildcard', required: false },
  { name: 'json_parameter', description: 'To "stuff" the JSON into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false },
  { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when JSON Parameter is set', type: 'wildcard', required: false }
].concat(variables);



//
// Exports ----------------------------------------------------------------
//

module.exports = {
  name: 'JSON',
  request,
  response,
  validate(vars) {
    let left, left1, left2;
    return (left = (left1 = (left2 = validate.url(vars)) != null ? left2 : validate.method(vars, ['POST', 'PUT', 'DELETE'])) != null ? left1 : validate.outcome(vars)) != null ? left : validate.headers(vars, 'json');
  }
};

