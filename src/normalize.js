// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let normalize;
const _ = require('lodash');
const flat = require('flat');
const unidecode = require('unidecode');
const querystring = require('querystring');

// use valueOf to ensure the normal version is sent for all richly typed values
const valueOf = function(value, toAscii) {
  if (value == null) { return value; }
  if ((value != null ? value.valid : undefined) === false) {
    // invalid richly typed values should be set to the raw value
    if (toAscii) { return unidecode(value.raw); } else { return value.raw; }
  } else {
    if ((value != null ? value.valueOf() : undefined) != null) {
      if (toAscii) { return unidecode(value.valueOf()); } else { return value.valueOf(); }
    } else {
      return null;
    }
  }
};


module.exports = (normalize = function(obj, toAscii, encodeValues) {
  if (toAscii == null) { toAscii = false; }
  if (encodeValues == null) { encodeValues = false; }
  if (obj == null) { return obj; }

  if (_.isArray(obj)) {
    return obj.map(val => normalize(val, toAscii));
  } else if (_.isPlainObject(obj)) {
    const rtn = {};
    const object = flat.unflatten(obj);
    for (let key in object) {
      let value = object[key];
      value = normalize(value, toAscii);
      // encode values separately here in (less-common) case that the keys won't be encoded later
      rtn[key] = encodeValues ? querystring.escape(value) : value;
    }
    return rtn;
  } else {
    return valueOf(obj, toAscii);
  }
});
