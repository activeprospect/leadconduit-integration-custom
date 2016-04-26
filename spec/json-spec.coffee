assert = require('chai').assert
integration = require('../src/json')
types = require('leadconduit-types')


describe 'Outbound JSON request', ->

  it 'should have url, method, headers, and body', ->
    vars =
      url: 'http://foo.bar'
      json_property:
        fname: 'Mel'
        lname: 'Gibson'
      header:
        Whatever: 'foo'
        Bar: 'baz'

    assert.equal integration.request(vars).url, 'http://foo.bar'
    assert.equal integration.request(vars).method, 'POST'
    assert.equal integration.request(vars).body, '{"fname":"Mel","lname":"Gibson"}'
    assert.deepEqual integration.request(vars).headers,
      'Content-Type': 'application/json; charset=utf-8'
      'Content-Length': 32
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
      'Whatever': 'foo'
      'Bar': 'baz'


  it 'should support simple dot-notation', ->
    vars =
      json_property:
        'foo.bar.baz': 'bip'

    assert.equal integration.request(vars).body, '{"foo":{"bar":{"baz":"bip"}}}'


  it 'should support dot-notation arrays', ->
    vars =
      json_property:
        'foo.bar.baz.0': 'bip'
        'foo.bar.baz.1': 'bap'

    assert.equal integration.request(vars).body, '{"foo":{"bar":{"baz":["bip","bap"]}}}'


  it 'should support dot-notation array reference', ->
    vars =
      json_property:
        'foo.bar.baz': ['bip', 'bap']

    assert.equal integration.request(vars).body, '{"foo":{"bar":{"baz":["bip","bap"]}}}'


  it 'should normalize rich types', ->
    vars =
      json_property:
        postal_code: types.postal_code.parse('78704')
        phone: types.phone.parse('512-789-1111 x123')
        boolean: types.boolean.parse('T')
        gender: types.gender.parse('F')
        number: types.number.parse('$100,000.00')
        range: types.range.parse('1,000-2,000')

    assert.equal integration.request(vars).body, '{"postal_code":"78704","phone":"5127891111x123","boolean":true,"gender":"female","number":100000,"range":"1000-2000"}'


  it 'should normalize rich type array', ->
    vars =
      json_property:
        phones: [
          types.phone.parse('512-789-1111 x123')
          types.phone.parse('512-789-2222 x456')
        ]

    assert.equal integration.request(vars).body, '{"phones":["5127891111x123","5127892222x456"]}'


  it 'should use raw value for invalid rich types', ->
    vars =
      json_property:
        number: types.number.parse('foo')

    assert.equal integration.request(vars).body, '{"number":"foo"}'




describe 'JSON validation', ->

  it 'should require valid URL', ->
    assert.equal integration.validate({}), 'URL is required'


  it 'should require not require method', ->
    assert.isUndefined integration.validate(url: 'http://foo')


  it 'should require valid method', ->
    assert.equal integration.validate(url: 'http://foo', method: 'HEAD'), 'Unsupported HTTP method - use POST, PUT, DELETE'


  it 'should require valid search outcome', ->
    assert.equal integration.validate(url: 'http://foo', outcome_on_match: 'donkey'), "Outcome on match must be 'success' or 'failure'"


  it 'should pass validation', ->
    assert.isUndefined integration.validate(url: 'http://foo')


  it 'should not allow content-type header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Content-Type': 'foo' }), 'Content-Type header is not allowed'


  it 'should not allow content-length header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Content-Length': '10' }), 'Content-Length header is not allowed'


  it 'should not allow accept header', ->
    assert.equal integration.validate(url: 'http://foo', header: { 'Accept': 'text/whatever' }), 'Accept header is not allowed'
