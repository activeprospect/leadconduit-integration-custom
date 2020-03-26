const _ = require('lodash');
const u = require('url');

const isValidUrl = url => (url.protocol != null) &&
  url.protocol.match(/^http[s]?:/) &&
  url.slashes &&
  (url.hostname != null);


const url = function(vars) {
  // validate URL
  if (!vars.url) {
    return 'URL is required';
  }

  const url = u.parse(vars.url);

  if (!isValidUrl(url)) {
    return 'URL must be valid';
  }
};


const method = function(vars, allowed) {
  const method = _.result(vars, 'method.toUpperCase');
  if (!method) { return; }
  if (!(allowed.indexOf(method) >= 0)) {
    return `Unsupported HTTP method - use ${allowed.join(', ')}`;
  }
};


const outcome = function(vars) {
  if (!vars.outcome_on_match) { return; }

  if ((vars.outcome_on_match !== 'success') && (vars.outcome_on_match !== 'failure')) {
    return "Outcome on match must be 'success' or 'failure'";
  }
};


const headers = function(vars, contentTypeBase = '') {
  if (!_.isPlainObject(vars.header)) { return; }

  const headers = _.mapKeys(vars.header, (v, k) => k.toLowerCase());

  for (let disallowedHeader of ['Content-Length', 'Accept']) {
    if (headers[disallowedHeader.toLowerCase()]) { return `${disallowedHeader} header is not allowed`; }
  }

  // ensure that user-specified Content-Type is similar to what's allowed
  if ((headers['content-type'] != null) && !(headers['content-type'] != null ? headers['content-type'].match(new RegExp(contentTypeBase, 'i')) : undefined)) {
    return "Invalid Content-Type header value";
  }
}


module.exports = {
 url,
 method,
 outcome,
 headers
}
