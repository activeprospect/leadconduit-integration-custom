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
const flat = require('flat');
const querystring = require('querystring');
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

  // user-defined form field values
  let left;
  const parameters = vars.parameter != null ? vars.parameter : {};

  // build query content
  const content = flat.flatten(normalize(parameters, (left = (vars.send_ascii != null ? vars.send_ascii.valueOf() : undefined)) != null ? left : false), {safe: true});

  // URL encoded post body
  const query = querystring.encode(compact(content));

  return {
    url: `${vars.url}?${query}`,
    method: 'GET',
    headers: _.merge(headers(vars.header),
      {'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'})
  };
};


//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'parameter.*', description: 'Parameter name', type: 'wildcard', required: false }
].concat(variables);


//
// Exports ----------------------------------------------------------------
//

module.exports = {
  name: 'GET Query',
  request,
  response,
  validate(vars) {
    let left, left1;
    return (left = (left1 = validate.url(vars)) != null ? left1 : validate.outcome(vars)) != null ? left : validate.headers(vars, 'No_Content_Type_allowed_for_GET');
  }
};
