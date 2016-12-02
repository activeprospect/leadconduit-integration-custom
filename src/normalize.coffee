_ = require('lodash')
flat = require('flat')
unidecode = require('unidecode')

numericPropertyRegexp = /(.*)(\{\d+\})$/
numericPropertyBracketRegexp = /[{}]/g

# use valueOf to ensure the normal version is sent for all richly typed values
valueOf = (value, toAscii) ->
  if value?.valid == false
    # invalid richly typed values should be set to the raw value
    if toAscii then unidecode(value.raw) else value.raw
  else
    if value?.valueOf()?
      if toAscii then unidecode(value.valueOf()) else value.valueOf()
    else
      null


module.exports = (obj, toAscii = false) ->
  content = {}
  return content unless obj?

  for key, value of flat.flatten(obj)
    # fields with undefined as the value are not included
    continue if typeof value == 'undefined'

    if match = key.match(numericPropertyRegexp)
      # numeric object property notation
      key = match[1]
      property = match[2].replace(numericPropertyBracketRegexp, '')
      content[key] ?= {}
      content[key][property] = valueOf(value, toAscii)
    else
      content[key] = valueOf(value, toAscii)

  flat.unflatten content
