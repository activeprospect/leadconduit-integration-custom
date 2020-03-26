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
  const parameters = vars.parameter != null ? vars.parameter : {};

  // build query content
  const content = flat.flatten(normalize(parameters, _.result(vars, 'send_ascii.valueOf', false)), {safe: true});

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

//
// Validate --------------------------------------------------------------
//

module.exports = {
  request,
  response,
  validate: function(vars) {
    return validate.url(vars) || 
           validate.outcome(vars) ||
           validate.headers(vars, 'No_Content_Type_allowed_for_GET')
  }
};
