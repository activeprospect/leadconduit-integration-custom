_ = require('lodash')
builder = require('xmlbuilder')
helpers = require('./helpers')
xmlDoc = require('./xml-doc')
response = require('./response')
validate = require('./validate')
variables = require('./variables')
headers = require('./headers')



#
# Request Function --------------------------------------------------------
#

request = (vars) ->

  obj = xmlDoc(vars.xml_path)
  body =
    if Object.keys(obj).length
      builder.create(obj).end(pretty: true)
    else
      '<?xml version="1.0"?>'

  contentType = vars.header?['Content-Type'] ? 'text/xml'

  if vars.xml_parameter
    body = helpers.parameterize(vars.xml_parameter, body, vars.extra_parameter)
    contentType = 'application/x-www-form-urlencoded'

  url: vars.url
  method: vars.method?.toUpperCase() ? 'POST'
  headers: _.merge headers(vars.header),
    'Content-Type': contentType
    'Content-Length': Buffer.byteLength(body)
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
  body: body



#
# Variables --------------------------------------------------------------
#

request.variables = ->
  [
    { name: 'url', description: 'Server URL', type: 'string', required: true }
    { name: 'method', description: 'HTTP method (POST, PUT)', type: 'string', required: false }
    { name: 'xml_path.*', description: 'XML path in dot notation', type: 'wildcard', required: false }
    { name: 'xml_parameter', description: 'To "stuff" the XML into a parameter and send as Form URL encoded, specify the parameter name', type: 'string', required: false }
    { name: 'extra_parameter.*', description: 'Extra parameters to include in URL, only used when XML Parameter is set', type: 'wildcard', required: false }
  ].concat(variables)



#
# Exports ----------------------------------------------------------------
#

module.exports =
  name: 'XML'
  request: request
  response: response
  validate: (vars) ->
    validate.url(vars) ?
      validate.method(vars, ['POST', 'PUT']) ?
      validate.outcome(vars) ?
      validate.headers(vars, 'xml')

