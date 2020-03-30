const _ = require('lodash');
const normalize = require('./normalize');

const headers = function(header) {
  if (!_.isPlainObject(header)) { return {}; }

  return _(normalize(header))
    .mapValues(function(v) {
      if (_.isArray(v)) {
        return v.join(', ');
      } else if (_.isPlainObject(v)) {
        return '';
      } else {
        return v.toString();
      }}).omitBy((v, k) => !((v) && v.trim())).value();
};

module.exports = headers;