// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');
const flat = require('flat');
const normalize = require('./normalize');
const querystring = require('querystring');
const regexParser = require('regex-parser');

module.exports = {
  inverseOutcome(outcome) {
    switch (outcome) {
      case 'success': return 'failure';
      case 'failure': return 'success';
      default: return 'success';
    }
  },

  ensureArray(val) {
    if (val == null) { return []; }
    if (!_.isArray(val)) { val = [val]; }
    return val;
  },

  toRegex(expression) {
    expression = expression != null ? expression.trim().toLowerCase() : undefined;
    if (!expression) { return regexParser('.*'); }
    try {
      return regexParser(expression);
    } catch (err) {
      return null;
    }
  },

  // stuff formatted body (e.g., XML or JSON) into a named parameter, along with any "extra" parameters
  parameterize(param, body, extraParams) {
    const b = {};
    b[param] = body;
    if (extraParams) {
      const params = flat.flatten(normalize(extraParams), {safe:true});
      return querystring.stringify(_.merge(b,params));
    } else {
      return querystring.stringify(b);
    }
  }
};
