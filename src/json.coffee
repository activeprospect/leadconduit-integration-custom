_ = require('lodash')
querystring = require('querystring')
flat = require('flat')
response = require('./response')
validate = require('./validate')
normalize = require('./normalize')
variables = require('./variables')
headers = require('./headers')



#
# Request Function --------------------------------------------------------
#

request = (vars) ->
  body = JSON.stringify(normalize(vars.json_property))

  defaultHeaders =
    'Content-Type': 'application/json; charset=utf-8'
    'Content-Length': body.length
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'

  if vars.json_parameter
    b = {}
    b[vars.json_parameter] = body
    body = querystring.stringify(b)
    if vars.extra_parameter
      params = flat.flatten(normalize(vars.extra_parameter), safe:true)
      body = querystring.stringify(_.merge(b,params))
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
    defaultHeaders['Content-Length'] = Buffer.byteLength(body)

  url: vars.url
  method: vars.method?.toUpperCase() ? 'POST'
  headers: _.merge defaultHeaders, headers(vars.header)
  body: body



#
# Variables --------------------------------------------------------------
#

request.variables = ->
  [
    { name: 'url', description: 'Server URL', type: 'string', required: true }
    { name: 'method', description: 'HTTP method (POST, PUT, or DELETE)', type: 'string', required: true }
    { name: 'json_property.*', description: 'JSON property in dot notation', type: 'wildcard', required: false }
    { name: 'json_parameter', description: 'To "stuff" the JSON into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false }
    { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when JSON Parameter is set', type: 'wildcard', required: false }
  ].concat(variables)



#
# Exports ----------------------------------------------------------------
#

module.exports =
  name: 'JSON'
  request: request
  response: response
  validate: (vars) ->
    validate.url(vars) ?
      validate.method(vars, ['POST', 'PUT', 'DELETE']) ?
      validate.outcome(vars) ?
      validate.headers(vars, 'json')

