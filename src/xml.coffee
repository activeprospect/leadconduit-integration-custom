_ = require('lodash')
querystring = require('querystring')
builder = require('xmlbuilder')
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

  xmlPaths = flat.flatten(normalize(vars.xml_path))

  xmlPaths =
    _(xmlPaths)

      # Keys that don't contain @ or # are added as element text
      .mapKeys (value, key) ->
        if key.match(/@|#/)
          key
        else
          "#{key}#text"

      # The @ or # should be treated as nested values
      .mapKeys (value, key) ->
        key.replace(/(@|#)/, '.$1')

      .value()

  body = builder.create(flat.unflatten(xmlPaths)).end(pretty: true)

  contentType = 'text/xml'

  if vars.xml_parameter
    b = {}
    b[vars.xml_parameter] = body
    body = querystring.stringify(b)
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
      validate.headers(vars)

