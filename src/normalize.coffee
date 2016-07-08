_ = require('lodash')
flat = require('flat')
unidecode = require('unidecode')


module.exports = normalize = (obj, toAscii = false) ->
  content = {}
  return content unless obj?

  for key, value of flat.flatten(obj)
    # fields with undefined as the value are not included
    continue if typeof value == 'undefined'
    
    # use valueOf to ensure the normal version is sent for all richly typed values
    value =
      if value?.valid == false
        # invalid richly typed values should be set to the raw value
        if toAscii then unidecode(value.raw) else value.raw
      else
        if value?.valueOf()?
          if toAscii then unidecode(value.valueOf()) else value.valueOf()
        else
          null

    _.set(content, key, value)

  content
