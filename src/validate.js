/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');
const u = require('url');

const isValidUrl = url => (url.protocol != null) &&
  url.protocol.match(/^http[s]?:/) &&
  url.slashes &&
  (url.hostname != null);


module.exports = {
  url(vars) {
    // validate URL
    if (vars.url == null) {
      return 'URL is required';
    }

    const url = u.parse(vars.url);

    if (!isValidUrl(url)) {
      return 'URL must be valid';
    }
  },


  method(vars, allowed) {
    const method = vars.method != null ? vars.method.toUpperCase() : undefined;
    if (!method) { return; }
    if (!(allowed.indexOf(method) >= 0)) {
      return `Unsupported HTTP method - use ${allowed.join(', ')}`;
    }
  },


  outcome(vars) {
    if (!vars.outcome_on_match) { return; }

    if ((vars.outcome_on_match !== 'success') && (vars.outcome_on_match !== 'failure')) {
      return "Outcome on match must be 'success' or 'failure'";
    }
  },


  headers(vars, contentTypeBase) {
    if (contentTypeBase == null) { contentTypeBase = ''; }
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
};


