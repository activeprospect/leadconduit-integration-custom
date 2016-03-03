_ = require('lodash')
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
