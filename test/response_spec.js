const assert = require('chai').assert;
response = require('../lib/response')

describe('Validate', () => {

  it('should capture price on success', () => {
    const vars = {
      price_path: 'price',
      outcome_search_term: 'success'
    }
    const expected = {
      outcome: 'success',
      price: '18',
      status: 'success',
      auth_code: 'abc=='
    }
    const actual = response(vars, {}, json({ status:"success", price:18, auth_code:"abc==" }))
    assert.deepInclude(actual, expected);
  });
});

json = function(obj) {
  const body = JSON.stringify(obj, null, 2);
  return {
    body,
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  }
}