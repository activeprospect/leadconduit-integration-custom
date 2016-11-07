_ = require('lodash')

module.exports = compact = (obj) ->
  if _.isArray(obj)
    _.compact(obj).map(compact)
  else if _.isPlainObject(obj)
    for key, value of obj
      obj[key] = compact(value)
    obj
  else
    obj
