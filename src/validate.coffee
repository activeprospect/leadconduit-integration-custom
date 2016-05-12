_ = require('lodash')
u = require('url')

isValidUrl = (url) ->
  url.protocol? and
    url.protocol.match(/^http[s]?:/) and
    url.slashes and
    url.hostname?


module.exports =
  url: (vars) ->
    # validate URL
    unless vars.url?
      return 'URL is required'

    url = u.parse(vars.url)

    unless isValidUrl(url)
      return 'URL must be valid'


  method: (vars, allowed) ->
    method = vars.method?.toUpperCase()
    return unless method
    unless allowed.indexOf(method) >= 0
      return "Unsupported HTTP method - use #{allowed.join(', ')}"


  outcome: (vars) ->
    return unless vars.outcome_on_match

    unless vars.outcome_on_match == 'success' or vars.outcome_on_match == 'failure'
      "Outcome on match must be 'success' or 'failure'"


  headers: (vars, contentTypeBase = '') ->
    return unless _.isPlainObject(vars.header)

    headers = _.mapKeys vars.header, (v, k) ->
        k.toLowerCase()

    for disallowedHeader in ['Content-Length', 'Accept']
      return "#{disallowedHeader} header is not allowed" if headers[disallowedHeader.toLowerCase()]

    # ensure that user-specified Content-Type is similar to what's allowed
    if headers['content-type']? and !headers['content-type']?.match(new RegExp(contentTypeBase, 'i'))
      return "Invalid Content-Type header value"


