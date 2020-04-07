const _ = require('lodash');

const compact = function(obj) {
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
};

module.exports = compact;
