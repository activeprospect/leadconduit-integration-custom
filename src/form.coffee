_ = require('lodash')
flat = require('flat')
querystring = require('querystring')
response = require('./response')
validate = require('./validate')
normalize = require('./normalize')
variables = require('./variables')
headers = require('./headers')



#
# Request Function --------------------------------------------------------
#

request = (vars) ->

  # user-defined form field values
  formFields = vars.form_field ? {}

  # build body content
  content = flat.flatten(normalize(formFields, vars.send_ascii?.valueOf() ? false), safe: true)

  # URL encoded post body
  body = querystring.encode(content)

  defaultHeaders =
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    'Content-Length': body.length
    'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'

  url: vars.url
  method: 'POST'
  headers: _.merge defaultHeaders, headers(vars.header)
  body: body


#
# Variables --------------------------------------------------------------
#

request.variables = ->
  [
    { name: 'url', description: 'Server URL', type: 'string', required: true }
    { name: 'form_field.*', description: 'Form field name', type: 'wildcard', required: false }
  ].concat(variables)


#
# Exports ----------------------------------------------------------------
#

module.exports =
  name: 'Form POST'
  request: request
  response: response
  validate: (vars) ->
    validate.url(vars) ? validate.outcome(vars) ? validate.headers(vars, 'form-urlencoded')
