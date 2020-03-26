/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');
const normalize = require('./normalize');


module.exports = function(header) {
  if (!_.isPlainObject(header)) { return {}; }

  return _(normalize(header))
    .mapValues(function(v) {
      if (_.isArray(v)) {
        return v.join(', ');
      } else if (_.isPlainObject(v)) {
        return '';
      } else {
        return v.toString();
      }}).omitBy((v, k) => !(v != null ? v.trim() : undefined) || !(k != null ? k.trim() : undefined)).value();
};
