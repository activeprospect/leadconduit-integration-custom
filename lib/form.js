const _ = require('lodash');
const flat = require('flat');
const querystring = require('querystring');
const response = require('./response');
const validate = require('./validate');
const normalize = require('./normalize');
const variables = require('./variables');
const compact = require('./compact');
const headers = require('./headers');
const helpers = require('./helpers');



//
// Request Function --------------------------------------------------------
//

const request = function(vars) {

  // user-defined form field values
  const formFields = vars.form_field != null ? vars.form_field : {};
  const encodeValuesOnly = (vars.encode_form_field_names != null) && !(_.result(vars, 'encode_form_fields.valueOf'));

  // build body content
  const normalized = normalize(formFields, _.result(vars, 'send_ascii.valueOf', false), encodeValuesOnly);
  const content = flat.flatten(compact(normalized), {safe: true});

  // URL encode post body
  let body;
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

  if (vars.basic_username && vars.basic_password) {
    defaultHeaders['Authorization'] = helpers.encodeBasicAuth(vars.basic_username, vars.basic_password);
  }

  return {
    url: vars.url,
    method: 'POST',
    headers: _.merge(defaultHeaders, headers(vars.header)),
    followAllRedirects: !!vars.follow_redirects,
    body
  };
};


//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false },
  { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false },
  { name: 'encode_form_field_names', description: 'Whether form field names are URL-encoded (default: true)', type: 'boolean', required: false },
  { name: 'form_field.*', description: 'Form field name', type: 'wildcard', required: false }
].concat(variables);


//
// Exports ----------------------------------------------------------------
//

module.exports = {
  request,
  response,
  validate(vars) {
    return validate.url(vars) || validate.outcome(vars) || validate.headers(vars, 'form-urlencoded');
  }
};
