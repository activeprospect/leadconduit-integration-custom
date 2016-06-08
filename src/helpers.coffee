_ = require('lodash')
flat = require('flat')
normalize = require('./normalize')
querystring = require('querystring')
regexParser = require('regex-parser')

module.exports =
  inverseOutcome: (outcome) ->
    switch outcome
      when 'success' then 'failure'
      when 'failure' then 'success'
      else 'success'

  ensureArray: (val) ->
    return [] unless val?
    val = [val] if !_.isArray(val)
    val

  toRegex: (expression) ->
    expression = expression?.trim().toLowerCase()
    return regexParser('.*') unless expression
    try
      regexParser(expression)
    catch err
      null

  # stuff formatted body (e.g., XML or JSON) into a named parameter, along with any "extra" parameters
  parameterize: (param, body, extraParams) ->
    b = {}
    b[param] = body
    if extraParams
      params = flat.flatten(normalize(extraParams), safe:true)
      querystring.stringify(_.merge(b,params))
    else
      querystring.stringify(b)
