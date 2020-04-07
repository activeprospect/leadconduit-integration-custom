const _ = require('lodash');
const flat = require('flat');
const unidecode = require('unidecode');
const querystring = require('querystring');

// use valueOf to ensure the normal version is sent for all richly typed values
const valueOf = function(value, toAscii) {
  if (!value) return value;

  if (_.get(value, 'valid') == false) {
    // invalid richly typed values should be set to the raw value
    if (toAscii) { return unidecode(value.raw); } else { return value.raw; }
  } else {
    if (_.result(value, 'valueOf') != null) {
      if (toAscii) { return unidecode(value.valueOf()); } else { return value.valueOf(); }
    } else {
      return null;
    }
  }
};


const normalize = function(obj, toAscii = false, encodeValues = false) {
  if (!obj) { return obj; }

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
};

module.exports = normalize;
