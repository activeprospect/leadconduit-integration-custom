_ = require('lodash')
normalize = require('./normalize')


module.exports = (header) ->
  return {} unless _.isPlainObject(header)

  _(normalize(header))
    .mapValues (v) ->
      if _.isArray(v)
        v.join(', ')
      else if _.isPlainObject(v)
        ''
      else
        v.toString()
    .omitBy (v, k) ->
      !v?.trim() or !k?.trim()
    .value()
