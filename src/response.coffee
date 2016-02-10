_ = require('lodash')
mimecontent = require('mime-content')
parseMimeType = require('mimeparse').parseMimeType
regexParser = require('regex-parser')


response = (vars, req, res) ->

  # TODO: ERROR HANDLING!

  searchTerm = toRegex(vars.search_term)
  searchOutcome = vars.search_outcome?.trim().toLowerCase() ? 'success'
  searchPath = vars.search_path?.trim()
  reasonSelector = vars.reason_selector?.trim()

  # parse the document
  doc = toDoc(res.body, res.headers['Content-Type'])

  # narrow the search scope
  searchIn =
    if searchPath
      # limit search_term to this path in the document

      if _.isFunction(doc.xpath)
        # this is an XML document
        try doc.xpath(searchPath, true) catch

      else if _.isFunction(doc.html)
        # this is a HTML document
        try
          doc(searchPath).map(-> doc(this).html()).get()
        catch err
          [] # unmatched selector

      else if _.isPlainObject(doc)
        # this is a JS object (JSON)
        _.get(doc, searchPath)

      else if _.isString(doc)
        # this is plain text
        doc

    else
      # no search path was provided, so search the entire response body
      res.body


  # look in all possible search scopes for the term
  found =
    _(ensureArray(searchIn))
      .map _.trim
      .map _.toLower
      .compact()
      .some (searchIn) ->
        searchIn.match(searchTerm)


  # determine the outcome based on whether the search term was found
  outcome =
    if found
      searchOutcome
    else
      inverseOutcome(searchOutcome)


  # determine the reason based on the reason selector
  reasons =
    if _.isFunction(doc.xpath)
      # this is a XML document
      try doc.xpath(reasonSelector, true) catch

    else if _.isFunction(doc.html)
      # this is a HTML document
      try
        doc(reasonSelector).map(-> doc(this).text()).get()
      catch err
        [] # unmatched selector

    else if _.isPlainObject(doc)
      # this is a JS object (JSON)
      _.get(doc, reasonSelector)

    else if _.isString(doc)
      # this is a plain text. do a regex match and use the first match group
      doc.match(reasonSelector)?[1]?.trim()


  # trim and comma delimit reasons
  reason = _(ensureArray(reasons))
    .map _.trim
    .compact()
    .join(', ')


  # set the default reason, if necessary
  reason or= vars.default_reason?.trim()


  # build the event
  event =
    if _.isFunction(doc.toObject)
      # this is a XML document
      opts =
        explicitArray: false
        charkey: '#text'
        mergeAttrs: true
        trim: true
      try doc.toObject(opts) catch
    else if _.isPlainObject(doc)
      doc

  event ?= {}
  event.outcome = outcome
  event.reason = reason if reason

  # return the event
  event


response.variables = ->
  [
    { name: 'outcome', type: 'string', description: 'The outcome of the transaction (default is success)' }
    { name: 'reason', type: 'string', description: 'If the outcome was a failure, this is the reason' }
    { name: '*', type: 'wildcard' }
  ]


module.exports = response




#
# Helpers ----------------------------------------------------------------
#

inverseOutcome = (outcome) ->
  switch outcome
    when 'success' then 'failure'
    when 'failure' then 'success'
    else 'success'


ensureArray = (val) ->
  return [] unless val?
  val = [val] if !_.isArray(val)
  val


toRegex = (expression) ->
  expression = expression?.trim()
  return regexParser('.*') unless expression
  try
    regexParser(expression)
  catch err
    null


toDoc = (body, contentType) ->
  # parse mime type
  contentType = contentType ? 'text/plain'
  mimeParts = parseMimeType(contentType)
  mimeType = 'text/plain'
  mimeType = mimeParts.slice(0, 2).join('/') if mimeParts.length >= 2

  # return doc based on mimetype
  try
    mimecontent(body ? '', mimeType)
  catch err
    # content parsing error, fall back to string body
    body
