_ = require('lodash')
flat = require('flat')
querystring = require('querystring')
response = require('./response')
validate = require('./validate')
normalize = require('./normalize')
variables = require('./variables')
headers = require('./headers')
compact = require('./compact')


#
# Request Function --------------------------------------------------------
#

request = (vars) ->

  # user-defined form field values
  parameters = vars.parameter ? {}

  # build query content
  content = flat.flatten(normalize(parameters, vars.send_ascii?.valueOf() ? false), safe: true)

  # URL encoded post body
  query = querystring.encode(compact(content))

  url: "#{vars.url}?#{query}"
  method: 'GET'
  headers: _.merge headers(vars.header),
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'


#
# Variables --------------------------------------------------------------
#

request.variables = ->
  [
    { name: 'url', description: 'Server URL', type: 'string', required: true }
    { name: 'parameter.*', description: 'Parameter name', type: 'wildcard', required: false }
  ].concat(variables)


#
# Exports ----------------------------------------------------------------
#

module.exports =
  name: 'GET Query'
  request: request
  response: response
  validate: (vars) ->
    validate.url(vars) ? validate.outcome(vars) ? validate.headers(vars, 'No_Content_Type_allowed_for_GET')
