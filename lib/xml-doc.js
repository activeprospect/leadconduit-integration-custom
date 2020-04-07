const _ = require('lodash');
const flat = require('flat');
const normalize = require('./normalize');
const compact = require('./compact');


//
// Convert an object into one that can be used by xmlbuilder to create a XML document.
// Keys containing @ are treated as attributes.
//
module.exports = function(obj, toAscii = false) {
  let xmlPaths = flat.flatten(normalize(obj, toAscii) || {});

  xmlPaths =
    _(xmlPaths)

    // Keys that contain neither @ nor # are added as element text
    .mapKeys(function(value, key) {
      if (key.match(/@|#/)) {
        return key;
      } else {
        return `${key}#text`;
      }}).mapKeys((value, key) => key.replace(/(@|#)/, '.$1')).value();

  return compact(flat.unflatten(xmlPaths));
};
