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



