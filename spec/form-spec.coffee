assert = require('chai').assert
integration = require('../src/form')
types = require('leadconduit-types')


describe 'Outbound Form POST request', ->

  it 'should have url, method, headers, and body', ->
    vars =
      url: 'http://foo.bar'
      form_field:
        fname: 'Mel'
        lname: 'Gibson'

    assert.equal integration.request(vars).url, 'http://foo.bar'
    assert.equal integration.request(vars).method, 'POST'
    assert.equal integration.request(vars).body, 'fname=Mel&lname=Gibson'
    assert.deepEqual integration.request(vars).headers,
      'Content-Type': 'application/x-www-form-urlencoded'
      'Content-Length': 22
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;0.6,text/plain;q=0.5'


  it 'should support simple dot-notation', ->
    vars =
      form_field:
        'foo.bar.baz': 'bip'

    assert.equal integration.request(vars).body, 'foo.bar.baz=bip'


  it 'should support dot-notation arrays', ->
    vars =
      form_field:
        'foo.bar.baz.0': 'bip'
        'foo.bar.baz.1': 'bap'

    assert.equal integration.request(vars).body, 'foo.bar.baz=bip&foo.bar.baz=bap'


  it 'should support dot-notation array reference', ->
    vars =
      form_field:
        'foo.bar.baz': ['bip', 'bap']

    assert.equal integration.request(vars).body, 'foo.bar.baz=bip&foo.bar.baz=bap'


  it 'should normalize rich types', ->
    vars =
      form_field:
        postal_code: types.postal_code.parse('78704')
        phone: types.phone.parse('512-789-1111 x123')
        boolean: types.boolean.parse('T')
        gender: types.gender.parse('F')
        number: types.number.parse('$100,000.00')
        range: types.range.parse('1,000-2,000')

    assert.equal integration.request(vars).body, 'postal_code=78704&phone=5127891111x123&boolean=true&gender=female&number=100000&range=1000-2000'


  it 'should normalize rich type array', ->
    vars =
      form_field:
        phones: [
          types.phone.parse('512-789-1111 x123')
          types.phone.parse('512-789-2222 x456')
        ]

    assert.equal integration.request(vars).body, 'phones=5127891111x123&phones=5127892222x456'


  it 'should use raw value for invalid rich types', ->
    vars =
      form_field:
        number: types.number.parse('foo')

    assert.equal integration.request(vars).body, 'number=foo'



describe 'Outbound Form POST validation', ->

  it 'should require valid URL', ->
    assert.equal integration.validate({}), 'URL is required'


  it 'should require valid search outcome', ->
    assert.equal integration.validate(url: 'http://foo', outcome_on_match: 'donkey'), "Outcome on match must be 'success' or 'failure'"


  it 'should pass validation', ->
    assert.isUndefined integration.validate(url: 'http://foo')
