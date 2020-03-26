// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let compact;
const _ = require('lodash');

module.exports = (compact = function(obj) {
  if (_.isArray(obj)) {
    return _.compact(obj).map(compact);
  } else if (_.isPlainObject(obj)) {
    for (let key in obj) {
      const value = obj[key];
      obj[key] = compact(value);
    }
    return obj;
  } else {
    return obj;
  }
});
