_ = require('lodash')
mimecontent = require('mime-content')
parseMimeType = require('mimeparse').parseMimeType
setCookie = require('set-cookie-parser')

helpers = require('./helpers')
ensureArray = helpers.ensureArray
inverseOutcome = helpers.inverseOutcome
toRegex = helpers.toRegex


response = (vars, req, res) ->

  if errorStatus(res.status)
    # HTTP error code
    return outcome: 'error', reason: 'Server error'

  searchTerm = toRegex(vars.outcome_search_term)
  searchOutcome = vars.outcome_on_match?.trim().toLowerCase() ? 'success'
  searchPath = vars.outcome_search_path?.trim()
  reasonSelector = vars.reason_path?.trim()

  # parse the document. Use Content-Type override if provided.
  if vars.response_content_type_override
    doc = toDoc(res.body, vars.response_content_type_override)
  else
    doc = toDoc(res.body, res.headers['Content-Type'])

  # default to success if no search term and no outcome are specified
  if !vars.outcome_search_term and !vars.outcome_on_match
    outcome = 'success'

  else
    # narrow the search scope
    searchIn =
      if searchPath
        # limit outcome_search_term to this path in the document

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
      if reasonSelector
        attrRegex = /\s*\@([a-z_:]+[-a-z0-9_:.]]?)/i
        attrMatch = reasonSelector.match(attrRegex)
        reasonSelector = reasonSelector.replace(attrRegex, '')
        try
          elements = doc(reasonSelector)
          if attrMatch
            elements.map(-> doc(this).attr(attrMatch[1])).get()
          else
            elements.map(-> doc(this).text()).get()
        catch err
          [] # unmatched selector
      else
        []

    else if _.isPlainObject(doc)
      # this is a JS object (JSON)
      _.get(doc, reasonSelector)

    else if _.isString(doc)
      # this is a plain text. do a regex match and use the first match group
      regex = toRegex(reasonSelector)
      doc.match(regex)?[1]?.trim() if regex


  # trim and comma delimit reasons
  reason = _(ensureArray(reasons))
    .map extractCData
    .map _.trim
    .compact()
    .sort()
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
      # This is a JSON object
      doc
    else if _.isPlainObject(vars.capture)
      # Use any "capture" variables to capture parts of the text into properties from unstructured text
      doc = doc.html() if _.isFunction(doc.html)
      e = {}
      for property, regex of vars.capture
        value = doc.match(toRegex(regex))?[1]
        e[property] = value if value?
      e

  event ?= {}

  # extract cookies and add to event
  if vars.collect_cookies
    cookies = _(res.headers['Set-Cookie'])
      .map parseCookie 
      .groupBy 'name'
      .map processCookie 
      .reduce formatCookie,{} 
    event[vars.collect_cookies] = cookies

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

toDoc = (body, contentType) ->
  # parse mime type
  contentType = contentType ? 'text/plain'
  mimeParts = parseMimeType(contentType)
  mimeType = 'text/plain'
  mimeType = mimeParts.slice(0, 2).join('/') if mimeParts.length >= 2

  # return doc based on mimetype
  try
    mimecontent(body ? '', mimeType) ? body
  catch err
    # content parsing error, fall back to string body
    body


errorStatus = (statusCode) ->
  error = statusCode % 500
  error >= 0 and error < 100


# if the given value is CDATA, extract that character data from the <![CDATA[...]]> wrapper
extractCData = (value) ->
  return unless value
  value.nodeValue ? value.toString()


# Perform initial parsing of cookies, exposing raw and decoded values as
# possible.
parseCookie = (value) ->
  value = _(setCookie.parse(value,{decodeValues: false}))
    .map (v) -> 
      v['value_raw'] = v['value']
      try
        v['value'] = decodeURIComponent(v['value_raw'])
      catch
        v['value'] = null
      v
    .reduce (m,v,k) ->
      m[k] = v
      m
  value


# Process all cookies of a given cookie-name, handling RFC-breaking behaviour
# according to spec/response-spec.coffee. 
processCookie = (value) ->
  # Normal cookie.
  if value.length == 1
    return value
  # Cookies that don't conform to RFC 6265.
  # Find duplicate (name,path,domain) cookies, and only keep the latest.
  value = _(value)
    .groupBy (v) ->
      v.name+v.path+v.domain
    .map (v) ->
      _.last(v)
    .value()
  value;

# Construct final form of cookie holder in event object.
formatCookie = (r,v) ->
  if v.length == 1
    r[v[0]['name']]=v[0]
  else
    r[v[0]['name']]=v
  r
