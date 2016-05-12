assert = require('chai').assert
integration = require('../src/query')
types = require('leadconduit-types')


describe 'Outbound GET Query request', ->

  it 'should have url, method, and headers', ->
    vars =
      url: 'http://foo.bar'
      parameter:
        fname: 'Mel'
        lname: 'Gibson'
      header:
        Whatever: 'foo'

    assert.equal integration.request(vars).url, 'http://foo.bar?fname=Mel&lname=Gibson'
    assert.equal integration.request(vars).method, 'GET'
    assert.deepEqual integration.request(vars).headers,
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
      'Whatever': 'foo'


  it 'should support simple dot-notation', ->
    vars =
      parameter:
        'foo.bar.baz': 'bip'

    assert.equal integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip'


  it 'should support dot-notation arrays', ->
    vars =
      parameter:
        'foo.bar.baz.0': 'bip'
        'foo.bar.baz.1': 'bap'

    assert.equal integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip&foo.bar.baz=bap'


  it 'should support dot-notation array reference', ->
    vars =
      parameter:
        'foo.bar.baz': ['bip', 'bap']

    assert.equal integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip&foo.bar.baz=bap'


  it 'should normalize rich types', ->
    vars =
      parameter:
        postal_code: types.postal_code.parse('78704')
        phone: types.phone.parse('512-789-1111 x123')
        boolean: types.boolean.parse('T')
        gender: types.gender.parse('F')
        number: types.number.parse('$100,000.00')
        range: types.range.parse('1,000-2,000')

    assert.equal integration.request(vars).url.split('?')[1], 'postal_code=78704&phone=5127891111x123&boolean=true&gender=female&number=100000&range=1000-2000'


  it 'should normalize rich type array', ->
    vars =
      parameter:
        phones: [
          types.phone.parse('512-789-1111 x123')
          types.phone.parse('512-789-2222 x456')
        ]

    assert.equal integration.request(vars).url.split('?')[1], 'phones=5127891111x123&phones=5127892222x456'


  it 'should use raw value for invalid rich types', ->
    vars =
      parameter:
        number: types.number.parse('foo')

    assert.equal integration.request(vars).url.split('?')[1], 'number=foo'



describe 'Outbound GET Query validation', ->

  it 'should require valid URL', ->
    assert.equal integration.validate({}), 'URL is required'


  it 'should require valid search outcome', ->
    assert.equal integration.validate(url: 'http://foo', outcome_on_match: 'donkey'), "Outcome on match must be 'success' or 'failure'"


  it 'should pass validation', ->
    assert.isUndefined integration.validate(url: 'http://foo')


  it 'should not allow content-type header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Content-Type': 'foo' }), 'Invalid Content-Type header value'


  it 'should not allow content-length header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Content-Length': '10' }), 'Content-Length header is not allowed'


  it 'should not allow accept header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Accept': 'text/whatever' }), 'Accept header is not allowed'
