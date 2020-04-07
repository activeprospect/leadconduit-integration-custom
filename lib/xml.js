const _ = require('lodash');
const builder = require('xmlbuilder');
const helpers = require('./helpers');
const xmlDoc = require('./xml-doc');
const response = require('./response');
const validate = require('./validate');
const variables = require('./variables');
const headers = require('./headers');



//
// Request Function --------------------------------------------------------
//

const request = function(vars) {
  const obj = xmlDoc(vars.xml_path, _.result(vars, 'send_ascii.valueOf', false));
  let body = (Object.keys(obj).length) ? builder.create(obj).end({pretty: true}) : '<?xml version="1.0"?>';
  let contentType = (vars.header && vars.header['Content-Type']) ? vars.header['Content-Type'] : 'text/xml';

  if (vars.xml_parameter) {
    body = helpers.parameterize(vars.xml_parameter, body, vars.extra_parameter);
    contentType = 'application/x-www-form-urlencoded';
  }

  defaultHeaders = {
    'Content-Type': contentType,
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
  }

  if (vars.basic_username && vars.basic_password) {
    defaultHeaders['Authorization'] = helpers.encodeBasicAuth(vars.basic_username, vars.basic_password);
  }

  defaultHeaders['Content-Length'] = Buffer.byteLength(body);

  return {
    url: vars.url,
    method: _.result(vars, 'method.toUpperCase') || 'POST',
    headers: _.merge(defaultHeaders, headers(vars.header)),
    body
  };
};



//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'method', description: 'HTTP method (POST, PUT)', type: 'string', required: false },
  { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false },
  { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false },
  { name: 'xml_path.*', description: 'XML path in dot notation', type: 'wildcard', required: false },
  { name: 'xml_parameter', description: 'To "stuff" the XML into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false },
  { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when XML Parameter is set', type: 'wildcard', required: false }
].concat(variables);



//
// Exports ----------------------------------------------------------------
//

module.exports = {
  request,
  response,
  validate(vars) {
    return validate.url(vars) ||
           validate.method(vars, ['POST', 'PUT']) ||
           validate.outcome(vars) ||
           validate.headers(vars, 'xml')
  }
};
