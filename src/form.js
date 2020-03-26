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
const compact = require('./compact');
const headers = require('./headers');



//
// Request Function --------------------------------------------------------
//

const request = function(vars) {

  // user-defined form field values
  let body, left;
  const formFields = vars.form_field != null ? vars.form_field : {};

  const encodeValuesOnly = (vars.encode_form_field_names != null) && !(vars.encode_form_field_names != null ? vars.encode_form_field_names.valueOf() : undefined);

  // build body content
  const normalized = normalize(formFields, (left = (vars.send_ascii != null ? vars.send_ascii.valueOf() : undefined)) != null ? left : false, encodeValuesOnly);
  const content = flat.flatten(compact(normalized), {safe: true});

  // URL encode post body
  if (encodeValuesOnly) {
    body = querystring.stringify(content, null, null, {encodeURIComponent: component => { return component; } });
  } else {
    body = querystring.stringify(content);
  }

  const defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
  };

  return {
    url: vars.url,
    method: 'POST',
    headers: _.merge(defaultHeaders, headers(vars.header)),
    body
  };
};


//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'encode_form_field_names', description: 'Whether form field names are URL-encoded (default: true)', type: 'boolean', required: false },
  { name: 'form_field.*', description: 'Form field name', type: 'wildcard', required: false }
].concat(variables);


//
// Exports ----------------------------------------------------------------
//

module.exports = {
  name: 'Form POST',
  request,
  response,
  validate(vars) {
    let left, left1;
    return (left = (left1 = validate.url(vars)) != null ? left1 : validate.outcome(vars)) != null ? left : validate.headers(vars, 'form-urlencoded');
  }
};
