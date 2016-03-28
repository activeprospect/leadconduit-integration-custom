module.exports = {
  name: 'Custom',
  outbound: {
    form: require('./lib/form'),
    json: require('./lib/json'),
    soap: require('./lib/soap')
  }
};
