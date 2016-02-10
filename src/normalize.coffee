_ = require('lodash')
flat = require('flat')


module.exports = normalize = (obj) ->
  content = {}
  return content unless obj?

  for key, value of flat.flatten(obj)
    # fields with undefined as the value are not included
    continue if typeof value == 'undefined'

    # use valueOf to ensure the normal version is sent for all richly typed values
    value =
      if value?.valid == false
        # invalid richly typed values should be set to the raw value
        value.raw
      else
        value?.valueOf() ? null

    _.set(content, key, value)

  content
