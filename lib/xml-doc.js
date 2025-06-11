const _ = require('lodash');
const { flatten } = require('flat');
const normalize = require('./normalize');
const compact = require('./compact');


//
// Convert an object into one that can be used by xmlbuilder to create an XML document.
// Keys containing @ are treated as attributes.
//
module.exports = function(obj, toAscii = false) {
  let xmlPaths = flatten(obj || {});

  xmlPaths =
    _(xmlPaths)
    // Keys that contain neither @ nor # are added as element text
    .mapKeys((value, key) =>  (key.match(/[@#]/)) ? key: `${key}#text`)
      .mapKeys((value, key) => key.replace(/([@#])/, '.$1')).value();

  return compact(normalize(xmlPaths, toAscii));
};
