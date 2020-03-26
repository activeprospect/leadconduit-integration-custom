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

  let left, left1;
  const obj = xmlDoc(vars.xml_path, (left = (vars.send_ascii != null ? vars.send_ascii.valueOf() : undefined)) != null ? left : false);
  let body =
    Object.keys(obj).length ?
      builder.create(obj).end({pretty: true})
    :
      '<?xml version="1.0"?>';

  let contentType = (vars.header != null ? vars.header['Content-Type'] : undefined) != null ? (vars.header != null ? vars.header['Content-Type'] : undefined) : 'text/xml';

  if (vars.xml_parameter) {
    body = helpers.parameterize(vars.xml_parameter, body, vars.extra_parameter);
    contentType = 'application/x-www-form-urlencoded';
  }

  return {
    url: vars.url,
    method: (left1 = (vars.method != null ? vars.method.toUpperCase() : undefined)) != null ? left1 : 'POST',
    headers: _.merge(headers(vars.header), {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
    }
    ),
    body
  };
};



//
// Variables --------------------------------------------------------------
//

request.variables = () => [
  { name: 'url', description: 'Server URL', type: 'string', required: true },
  { name: 'method', description: 'HTTP method (POST, PUT)', type: 'string', required: false },
  { name: 'xml_path.*', description: 'XML path in dot notation', type: 'wildcard', required: false },
  { name: 'xml_parameter', description: 'To "stuff" the XML into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false },
  { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when XML Parameter is set', type: 'wildcard', required: false }
].concat(variables);



//
// Exports ----------------------------------------------------------------
//

module.exports = {
  name: 'XML',
  request,
  response,
  validate(vars) {
    let left, left1, left2;
    return (left = (left1 = (left2 = validate.url(vars)) != null ? left2 : validate.method(vars, ['POST', 'PUT'])) != null ? left1 : validate.outcome(vars)) != null ? left : validate.headers(vars, 'xml');
  }
};

