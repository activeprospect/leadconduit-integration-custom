_ = require('lodash')
flat = require('flat')
unidecode = require('unidecode')

numericPropertyRegexp = /(.*)(\{\d+\})/
numericPropertyBracketRegexp = /[{}]/g

# use valueOf to ensure the normal version is sent for all richly typed values
valueOf = (value, toAscii) ->
  return value unless value?
  if value?.valid == false
    # invalid richly typed values should be set to the raw value
    if toAscii then unidecode(value.raw) else value.raw
  else
    if value?.valueOf()?
      if toAscii then unidecode(value.valueOf()) else value.valueOf()
    else
      null


module.exports = normalize = (obj, toAscii = false) ->
  return obj unless obj?

  if _.isArray(obj)
    obj.map (val) ->
      normalize(val, toAscii)
  else if _.isPlainObject(obj)
    rtn = {}
    for key, value of flat.unflatten(obj)
      value = normalize(value, toAscii)
      continue if value == undefined
      if match = key.match(numericPropertyRegexp)
        # numeric object property notation
        key = match[1]
        property = match[2].replace(numericPropertyBracketRegexp, '')
        rtn[key] ?= {}
        rtn[key][property] = value
      else
        rtn[key] = value
    rtn
  else
    valueOf(obj, toAscii)
