_ = require('lodash')
flat = require('flat')
normalize = require('./normalize')
compact = require('./compact')


#
# Convert an object into one that can be used by xmlbuilder to create a XML document.
# Keys containing @ are treated as attributes.
#
module.exports = (obj, toAscii = false) ->

  xmlPaths = flat.flatten(normalize(obj, toAscii) ? {})

  xmlPaths =
    _(xmlPaths)

    # Keys that contain neither @ nor # are added as element text
    .mapKeys (value, key) ->
      if key.match(/@|#/)
        key
      else
        "#{key}#text"

    # The @ or # should be treated as nested values
    .mapKeys (value, key) ->
      key.replace(/(@|#)/, '.$1')

    .value()

  compact(flat.unflatten(xmlPaths))
