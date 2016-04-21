_ = require('lodash')
flat = require('flat')
soap = require('soap')
validate = require('./validate')

helpers = require('./helpers')
ensureArray = helpers.ensureArray
inverseOutcome = helpers.inverseOutcome
toRegex = helpers.toRegex



handle = (vars, callback) ->

  vars = flat.unflatten(vars)

  # get SOAP function arguments
  args = flat.flatten(vars.arg ? {})
  args = _.mapValues args, (value) ->
    value.valueOf()
  args = flat.unflatten(args)

  options =
    valueKey: '#value'
    forceSoap12Headers: vars.version?.trim() == '1.2'

  soap.createClient vars.url, options, (err, client) ->
    return callback(err) if err

    # the SOAP function to execute
    fxn = _.get(client, vars.function)

    # ensure the SOAP function is supported
    return callback(new Error('Unsupported SOAP function specified')) unless fxn

    # build the security credentials
    security =
      if vars.basic_username and vars.basic_password
        new soap.BasicAuthSecurity(vars.basic_username, vars.basic_password)
      else if vars.bearer_token
        new soap.BearerSecurity(vars.bearer_token)
      else if vars.wss_username and vars.wss_password
        passwordType =
          if vars.wss_digest_password
            'PasswordDigest'
          else
            'PasswordText'
        new soap.WSSecurity(vars.wss_username, vars.wss_password, passwordType: passwordType)

    # set the security credentials
    client.setSecurity(security) if security

    # the callback to handle the SOAP function response
    handleResponse = (err, result, body) ->
      result ?= {}
      fault = err?.root?.Envelope?.Body?.Fault
      if fault?
        return callback null, outcome: 'error', reason: fault.faultstring ? fault.faultcode
      else if err
        return callback(err)

      searchTerm = toRegex(vars.outcome_search_term)
      searchOutcome = vars.outcome_on_match?.trim().toLowerCase() ? 'success'
      searchPath = vars.outcome_search_path?.trim()
      reasonSelector = vars.reason_path?.trim()

      # narrow the search scope
      searchIn =
        if searchPath
          # limit outcome_search_term to this path in the document
          _.get(result, searchPath).toString()

        else
          # no search path was provided, so search the entire response body
          body

      # look in all possible search scopes for the term
      found = searchIn?.toLowerCase().match(searchTerm)

      # determine the outcome based on whether the search term was found
      outcome =
        if found
          searchOutcome
        else
          inverseOutcome(searchOutcome)

      # determine the reason based on the reason selector
      reasons =
        if reasonSelector
          _.get(result, reasonSelector)
        else
          []

      # trim and comma delimit reasons
      reason = _(ensureArray(reasons))
        .map _.trim
        .compact()
        .sort()
        .join(', ')

      # set the default reason, if necessary
      reason or= vars.default_reason?.trim()

      # build the event
      event = result
      event.outcome = outcome
      event.reason = reason if reason

      # return the event
      callback null, event

    # calculate the timeout
    timeoutMs = (vars.timeout_seconds ? 10) * 1000

    # call the function
    fxn args, handleResponse, timeout: timeoutMs



#
# Validate ---------------------------------------------------------------
#

validateFunction = (vars) ->
  return 'Function is required' unless vars.function?
  return 'Function must have valid name' unless vars.function.match(/^[a-zA-Z0-9_]+$/)


validateVersion = (vars) ->
  version = vars.version?.trim()
  return unless version?
  return 'Must be valid SOAP version: 1.1 or 1.2' unless version == '1.1' or version == '1.2'



#
# Variables --------------------------------------------------------------
#

requestVariables = ->
  [
    { name: 'url', description: 'WSDL URL', type: 'string', required: true }
    { name: 'function', description: 'Name of the SOAP function to call', type: 'string', required: true }
    { name: 'version', description: 'SOAP version to use: 1.1 or 1.2 (default: 1.1)', type: 'string', required: false }
    { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false }
    { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false }
    { name: 'bearer_token', description: 'HTTP Bearer Token', type: 'string', required: false }
    { name: 'wss_username', description: 'WS Security user name', type: 'string', required: false }
    { name: 'wss_password', description: 'WS Security password', type: 'string', required: false }
    { name: 'wss_digest_password', description: 'Digest the WS Password (default: true)', type: 'boolean', required: false }
    { name: 'arg.*', description: 'Named function argument', type: 'wildcard', required: false }
    { name: 'outcome_search_term', description: 'The text to search for in the response. When found outcome will be "success". Regular expressions are allowed. Pro tip: Use Outcome on Match to use this term to search for "failure" instead of "success".', type: 'string', required: false }
    { name: 'outcome_search_path', description: 'Narrow the search scope using dot-notation path', type: 'string', required: false }
    { name: 'outcome_on_match', description: 'The outcome when the search term is found - "success" or "failure" (default: success)', type: 'string', required: false }
    { name: 'reason_path', description: 'The dot-notation path used to find the failure reason', type: 'string', required: false }
    { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Path setting', type: 'string', required: false }
  ]


responseVariables = ->
  [
    { name: 'outcome', type: 'string', description: 'The outcome of the SOAP transaction (default is success)' }
    { name: 'reason', type: 'string', description: 'If the outcome was a failure, this is the reason' }
    { name: '*', type: 'wildcard' }
  ]



module.exports =
  name: 'SOAP'
  handle: handle
  requestVariables: requestVariables
  responseVariables: responseVariables
  validate: (vars) ->
    validate.url(vars) ?
    validate.outcome(vars) ?
    validateFunction(vars) ?
    validateVersion(vars)


