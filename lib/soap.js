const _ = require('lodash');
const flat = require('flat');
const soap = require('soap');
const builder = require('xmlbuilder');
const mimecontent = require('mime-content');
const xmlDoc = require('./xml-doc');
const normalize = require('./normalize');
const validate = require('./validate');
const compact = require('./compact');

const { ensureArray, inverseOutcome, toRegex } = require('./helpers');

const handle = function(vars, callback) {

  vars = flat.unflatten(vars);
  const options = {
    valueKey: '#value',
    forceSoap12Headers: (vars.version ? vars.version.trim() : undefined) === '1.2',
    disableCache: true
  };

  if (vars.root_namespace_prefix) {
    _.set(options, 'overrideRootElement.namespace', vars.root_namespace_prefix);
  }

  if (vars.root_xmlns_attribute_name && vars.root_xmlns_attribute_value) {
    _.set(options, 'overrideRootElement.xmlnsAttributes', [{
      name: vars.root_xmlns_attribute_name,
      value: vars.root_xmlns_attribute_value
    }
    ]);
  }

  soap.createClient(vars.url, options, function(err, client) {
    if (err) { return callback(err); }

    // the SOAP function to execute
    const fxn = _.get(client, vars.function);

    // ensure the SOAP function is supported
    if (!fxn) { return callback(new Error('Unsupported SOAP function specified')); }

    // find function description
    const description = flat.flatten(client.describe());

    // Some SOAP services want an object argument to be provided as XML encoded in a string
    // This function provides a way to look up the type for a specific argument name.
    const lookupType = function(argName) {
      const key = _.findKey(description, (value, key) => key.match(new RegExp(`${vars.function}.${argName}$`, 'i')));
      // Return the type. Sometimes type values are namespaced: 's:string'. So we split to get rid of the namespace.
      if (key) { return description[key].split(':')[1]; }
    };

    // get SOAP function arguments
    let args = normalize(
      vars.arg || {},
      _.result(vars, 'send_ascii.valueOf', false)
    )

    // This routine converts each argument that is an object to an XML string, if the argument's type calls for it.
    args = _.mapValues(args, function(value, key) {
      // when the argument is an object
      if (_.isPlainObject(value)) {
        //  figure out type for this argument
        const type = lookupType(`input.${key}`);
        if (type === 'string') {
          // when the argument should be a string, create XML document and convert to a string
          value = builder.create(xmlDoc(value)).end({pretty: true});
        }
      }
      return value;
    });

    // remove empty elements -- the SOAP library does not handle them well
    args = compact(args);

    // build the security credentials
    const security =
      (() => {
      if (vars.basic_username && vars.basic_password) {
        return new soap.BasicAuthSecurity(vars.basic_username, vars.basic_password);
      } else if (vars.bearer_token) {
        return new soap.BearerSecurity(vars.bearer_token);
      } else if (vars.wss_username && vars.wss_password) {
        const passwordType =
          vars.wss_digest_password ?
            'PasswordDigest'
          :
            'PasswordText';
        return new soap.WSSecurity(vars.wss_username, vars.wss_password, {passwordType});
      }
    })();

    // set the security credentials
    if (security) { client.setSecurity(security); }

    // set the headers
    if (_.isPlainObject(vars.soap_header)) {
      const obj = xmlDoc(vars.soap_header);
      for (let key in obj) {
        const value = obj[key];
        client.addSoapHeader(builder.create(_.pick(obj, key)).toString());
      }
    }

    // the callback to handle the SOAP function response
    const handleResponse = function(err, result, body) {
      const fault = _.get(err, 'root.Envelope.Body.Fault', null)
      if (fault != null) {
        return callback(null, { outcome: 'error', reason: fault.faultstring || fault.faultcode });
      } else if (err) {
        return callback(err);
      }

      result = result || {};
      // Sometimes, SOAP functions return a string that contains encoded XML.
      // This routine tries to detect that scenario so that the XML can be parsed.
      result = _.mapValues(result, function(value) {
        if (_.isString(value)) {
          const openElementCount = _.get(value.match(/</g), 'length', 0);
          const closeElementCount = _.get(value.match(/>/g), 'length', 0);
          if ((openElementCount > 0) && (openElementCount === closeElementCount)) {
            // This seems like a well-formed XML string, so parse it as such
            const opts = {
              explicitArray: false,
              charkey: '#text',
              mergeAttrs: true,
              trim: true
            };
            try {
              return mimecontent(value, 'text/xml').toObject(opts);
            } catch (err) {}
          }
        }
        return value;
      });

      const searchTerm = toRegex(vars.outcome_search_term);
      const searchOutcome  = _.result(vars, 'outcome_on_match.trim', 'success').toLowerCase()
      const searchPath     = _.result(vars, 'outcome_search_path.trim');
      const reasonSelector = _.result(vars, 'reason_path.trim');
      const priceSelector  = _.result(vars, 'price_path.trim');
      const referenceSelector = _.result(vars, 'reference_path.trim');

      // narrow the search scope

      const searchIn =
        searchPath ?
          // limit outcome_search_term to this path in the document
          _.get(result, searchPath, '').toString()
        :
          // no search path was provided, so search the entire response body
          body;

      // look in all possible search scopes for the term
      const found = (searchIn) ? searchIn.toLowerCase().match(searchTerm) : undefined;

      // determine the outcome based on whether the search term was found
      const outcome = (found) ? searchOutcome : inverseOutcome(searchOutcome);
      const price = (outcome === 'success') ? _.get(result, priceSelector) : undefined;
      const reference = _.get(result, referenceSelector);

      // determine the reason based on the reason selector
      const reasons = (reasonSelector) ? _.get(result, reasonSelector) : [];

      // trim and comma delimit reasons
      let reason = _(ensureArray(reasons))
        .map(_.trim)
        .compact()
        .sort()
        .join(', ');

      // set the default reason, if necessary
      if (!reason) { reason = _.result(vars, 'default_reason.trim') }

      // build the event
      const event = result;
      event.outcome = outcome;
      if (reason) { event.reason = reason; }
      event.price = price || 0;
      event.reference = reference;

      // return the event
      callback(null, event);
    };

    // calculate the timeout
    const timeoutMs = (vars.timeout_seconds != null ? vars.timeout_seconds : 10) * 1000;

    // call the function
    fxn(args, handleResponse, {timeout: timeoutMs});
  });
};



//
// Validate ---------------------------------------------------------------
//

const validateFunction = function(vars) {
  if (!vars.function) { return 'Function is required'; }
  if (!vars.function.match(/^[a-zA-Z0-9_.]+$/)) { return 'Function must have valid name'; }
};


const validateVersion = function(vars) {
  const version = vars.version != null ? vars.version.trim() : undefined;
  if (!version) { return; }
  if ((version !== '1.1') && (version !== '1.2')) { return 'Must be valid SOAP version: 1.1 or 1.2'; }
};



//
// Variables --------------------------------------------------------------
//

const requestVariables = () => [
  { name: 'url', description: 'WSDL URL', type: 'string', required: true },
  { name: 'function', description: 'Name of the SOAP function to call', type: 'string', required: true },
  { name: 'version', description: 'SOAP version to use: 1.1 or 1.2 (default: 1.1)', type: 'string', required: false },
  { name: 'basic_username', description: 'HTTP Basic Authentication user name', type: 'string', required: false },
  { name: 'basic_password', description: 'HTTP Basic Authentication password', type: 'string', required: false },
  { name: 'bearer_token', description: 'HTTP Bearer Token', type: 'string', required: false },
  { name: 'wss_username', description: 'WS Security user name', type: 'string', required: false },
  { name: 'wss_password', description: 'WS Security password', type: 'string', required: false },
  { name: 'wss_digest_password', description: 'Digest the WS Password (default: true)', type: 'boolean', required: false },
  { name: 'arg.*', description: 'Named function argument', type: 'wildcard', required: false },
  { name: 'outcome_search_term', description: 'The text to search for in the response. When found outcome will be "success". Regular expressions are allowed. Pro tip: Use Outcome on Match to use this term to search for "failure" instead of "success".', type: 'string', required: false },
  { name: 'outcome_search_path', description: 'Narrow the search scope using dot-notation path', type: 'string', required: false },
  { name: 'outcome_on_match', description: 'The outcome when the search term is found - "success" or "failure" (default: success)', type: 'string', required: false },
  { name: 'reason_path', description: 'The dot-notation path used to find the failure reason', type: 'string', required: false },
  { name: 'price_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the lead price', type: 'string', required: false },
  { name: 'reference_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the reference ID', type: 'string', required: false },
  { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Path setting', type: 'string', required: false },
  { name: 'soap_header.*', description: 'Custom SOAP header in the format root_name.header_name or root_name@xmlns', type: 'wildcard', required: false },
  { name: 'send_ascii', description: 'Set to true to ensure lead data is sent as ASCII for legacy recipients (default: false)', type: 'boolean', required: false },
  { name: 'root_namespace_prefix', description: 'namespace prefix for the body element', type: 'string', required: false },
  { name: 'root_xmlns_attribute_name', description: 'xmlns namespace attribute name for the body element', type: 'string', required: false },
  { name: 'root_xmlns_attribute_value', description: 'xmlns namespace attribute value for the body element', type: 'string', required: false }
];


const responseVariables = () => [
  { name: 'outcome', type: 'string', description: 'The outcome of the SOAP transaction (default is success)' },
  { name: 'reason', type: 'string', description: 'If the outcome was a failure, this is the reason' },
  { name: 'price', type: 'number', description: 'The price of the lead' },
  { name: '*', type: 'wildcard' }
];



module.exports = {
  handle,
  requestVariables,
  responseVariables,
  validate(vars) {
    return validate.url(vars) ||
           validate.outcome(vars) ||
           validateFunction(vars) ||
           validateVersion(vars)
  }
};
