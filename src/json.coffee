_ = require('lodash')
helpers = require('./helpers')
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

  json = normalize(vars.json_property, vars.send_ascii?.valueOf() ? false) ? {}

  # test whether the mappings indicate that a root array is being requested
  keys = Object.keys(json)
  rootArray = _.every keys, (key) ->
    key.match(/^\d+$/)

  if rootArray
    array = []
    for key, value of json
      array[key] = value
    json = array

  # compact all arrays
  json = compact(json)

  body = JSON.stringify(json)

  defaultHeaders =
    'Content-Type': 'application/json; charset=utf-8'
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'

  if vars.json_parameter
    body = helpers.parameterize(vars.json_parameter, body, vars.extra_parameter)
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

