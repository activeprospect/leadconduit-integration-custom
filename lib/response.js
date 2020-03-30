const _ = require('lodash');
const mimecontent = require('mime-content');
const { parseMimeType } = require('mimeparse');
const dotWild = require('dot-wild');

const { ensureArray, inverseOutcome, toRegex } = require('./helpers');


const response = function(vars, req, res) {

  let cookie, outcome, price;
  let err, attrRegex, attrMatch, elements, regex,  doc;
  if (errorStatus(res.status)) {
    // HTTP error code
    return {outcome: 'error', reason: 'Server error'};
  }

  if (vars.cookie_search_term != null) {
    cookie = extractCookie(res.headers['Set-Cookie'], vars.cookie_search_term);
  }

  const searchTerm = toRegex(vars.outcome_search_term);
  const searchOutcome = _.result(vars, 'outcome_on_match.trim', 'success').toLowerCase()
  const searchPath    = _.result(vars, 'outcome_search_path.trim');
  let reasonSelector  = _.result(vars, 'reason_path.trim');
  let priceSelector   = _.result(vars, 'price_path.trim');

  // parse the document. Use Content-Type override if provided.
  if (vars.response_content_type_override) {
    doc = toDoc(res.body, vars.response_content_type_override);
  } else {
    doc = toDoc(res.body, res.headers['Content-Type']);
  }

  // default to success if no search term and no outcome are specified
  if (!vars.outcome_search_term && !vars.outcome_on_match) {
    outcome = 'success';

  } else {
    // narrow the search scope
    let searchIn;
    if (searchPath) {
      // limit outcome_search_term to this path in the document

      if (_.isFunction(doc.xpath)) {
        // this is an XML document
        try {
          searchIn = doc.xpath(searchPath, true);
        } 
        catch (error3) {}

      } else if (_.isFunction(doc.html)) {
        // this is a HTML document
        try {
          searchIn = doc(searchPath).map(function() { return doc(this).html(); }).get();
        } catch (error) {
          err = error;
          searchIn = []; // unmatched selector
        }

      } else if (_.isPlainObject(doc)) {
        // this is a JS object (JSON)
        searchIn = _.get(doc, searchPath);

      } else if (_.isString(doc)) {
        // this is plain text
        searchIn = doc;
      }
    } else {
      // no search path was provided, so search the entire response body
      searchIn = res.body;
    }


    // look in all possible search scopes for the term
    const found =
      _(ensureArray(searchIn))
        .map(_.trim)
        .map(_.toLower)
        .compact()
        .some(searchIn => searchIn.match(searchTerm));

    // determine the outcome based on whether the search term was found
    outcome = found ? searchOutcome : inverseOutcome(searchOutcome);
  }

  // determine the price based on priceSelector
  if (priceSelector) {
    if (_.isFunction(doc.xpath)) {
      // this is a XML document
      try {
        price = doc.xpath(priceSelector, true);
      } 
      catch (error4) {}

    } else if (_.isFunction(doc.html)) {
      // this is a HTML document
      if (priceSelector) {
        attrRegex = /\s*\@([a-z_:]+[-a-z0-9_:.]]?)/i;
        attrMatch = priceSelector.match(attrRegex);
        priceSelector = priceSelector.replace(attrRegex, '');
        try {
          elements = doc(priceSelector);
          if (attrMatch) {
            price = elements.map(function() { return doc(this).attr(attrMatch[1]); }).get();
          } else {
            price = elements.map(function() { return doc(this).text(); }).get();
          }
        } catch (error1) {
          err = error1;
          price = []; // unmatched selector
        }
      } else {
        price = [];
      }

    } else if (_.isPlainObject(doc) || _.isArray(doc)) {
      // this is a JS object (JSON)
      price = dotWild.get(doc, priceSelector);

    } else if (_.isString(doc)) {
      // this is a plain text. do a regex match and use the first match group
      regex = toRegex(priceSelector);
      if (regex) {
        const match = doc.match(regex);
        if (match && typeof match[1] === 'string') {
          price = match[1].trim();
        }
      }
    }
  }

  // determine the reason based on the reason selector
  let reasons;
  if (_.isFunction(doc.xpath)) {
    // this is a XML document
    try {
      reasons = doc.xpath(reasonSelector, true);
    }
    catch (error5) {}

  } else if (_.isFunction(doc.html)) {
    // this is a HTML document
    if (reasonSelector) {
      attrRegex = /\s*\@([a-z_:]+[-a-z0-9_:.]]?)/i;
      attrMatch = reasonSelector.match(attrRegex);
      reasonSelector = reasonSelector.replace(attrRegex, '');
      try {
        elements = doc(reasonSelector);
        if (attrMatch) {
          reasons = elements.map(function() { return doc(this).attr(attrMatch[1]); }).get();
        } else {
          reasons = elements.map(function() { return doc(this).text(); }).get();
        }
      } catch (error2) {
        err = error2;
        reasons = []; // unmatched selector
      }
    } else {
      reasons = [];
    }

  } else if (_.isPlainObject(doc) || _.isArray(doc)) {
    // this is a JS object (JSON)
    reasons = dotWild.get(doc, reasonSelector);

  } else if (_.isString(doc)) {
    // this is a plain text. do a regex match and use the first match group
    regex = toRegex(reasonSelector);
    if (regex) {
      const match = doc.match(regex);
      if (match && typeof match[1] !== 'undefined') {
        reasons = match[1].trim();
      }
    }
  }

  // trim, sort, and comma delimit reasons
  let reason = _(ensureArray(reasons))
    .map(extractCData)
    .map(_.trim)
    .compact()
    .sort()
    .join(', ');

  // set the default reason, if necessary
  if (!reason) { reason = vars.default_reason != null ? vars.default_reason.trim() : undefined; }

  price = ensureArray(price)
    .map(extractCData)[0];

  // build the event
  let event;
  if (_.isFunction(doc.toObject)) {
    // this is a XML document
    const opts = {
      explicitArray: false,
      charkey: '#text',
      mergeAttrs: true,
      trim: true
    };
    try {
      event = doc.toObject(opts);
    }
    catch (error6) {}
  } else if (_.isPlainObject(doc)) {
    // This is a JSON object
    event = doc;
  } else if (_.isPlainObject(vars.capture)) {
    // Use any "capture" variables to capture parts of the text into properties from unstructured text
    if (_.isFunction(doc.html)) { doc = doc.html(); }
    const e = {};
    for (let property in vars.capture) {
      regex = vars.capture[property];
      const value = _.nth(doc.match(toRegex(regex)), 1);
      if (value != null) { e[property] = value; }
    }
    event = e;
  }

  if (event == null) { event = {}; }
  event.outcome = outcome;
  event.price = price || 0;
  if (reason) { event.reason = reason; }
  if (cookie) { event.cookie = cookie; }

  // return the event
  return event;
};


response.variables = () => [
  { name: 'outcome', type: 'string', description: 'The outcome of the transaction (default is success)' },
  { name: 'reason', type: 'string', description: 'If the outcome was a failure, this is the reason' },
  { name: 'cookie', type: 'string', description: 'The full cookie header string captured via match with \'cookie_search_term\'' },
  { name: 'price', type: 'number', description: 'The price of the lead' },
  { name: '*', type: 'wildcard' }
];


module.exports = response;




//
// Helpers ----------------------------------------------------------------
//

const toDoc = function(body, contentType) {
  // parse mime type
  contentType = contentType || 'text/plain';
  const mimeParts = parseMimeType(contentType);
  let mimeType = 'text/plain';
  if (mimeParts.length >= 2) {
    mimeType = mimeParts.slice(0, 2).join('/');
  }

  // return doc based on mimetype
  try {
    let content = mimecontent(body || '', mimeType);

    return (content != null) ? content : body;

  } catch (err) {
    // content parsing error, fall back to string body
    return body;
  }
};


const errorStatus = function(statusCode) {
  const error = statusCode % 500;
  return (error >= 0) && (error < 100);
};


const extractCookie = function(cookieHeaders, searchTerm) {
  if (!cookieHeaders) return;

  if (!_.isArray(cookieHeaders)) { cookieHeaders = new Array(cookieHeaders); }
  const cookieSearchTerm = toRegex(searchTerm);

  return cookieHeaders.sort().find(header => header.toLowerCase().match(cookieSearchTerm));
};


// if the given value is CDATA, extract that character data from the <![CDATA[...]]> wrapper
const extractCData = function(value) {
  if (!value) return;
  return value.nodeValue || value.toString();
};
