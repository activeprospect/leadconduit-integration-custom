module.exports = {
  name: 'Custom',
  outbound: {
    form: require('./lib/form'),
    json: require('./lib/json'),
    xml: require('./lib/xml'),
    soap: require('./lib/soap')
  }
};
