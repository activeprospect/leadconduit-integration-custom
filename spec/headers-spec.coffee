assert = require('chai').assert
headers = require('../src/headers')
types = require('leadconduit-types')


describe 'Headers', ->

  it 'should remove header with empty value', ->
    assert.deepEqual headers(Foo: 'bar', Baz: ''), Foo: 'bar'


  it 'should remove header with whitespace value', ->
    assert.deepEqual headers(Foo: 'bar', Baz: ' '), Foo: 'bar'


  it 'should join header with array value', ->
    assert.deepEqual headers(Foo: ['bar', 'baz'],), Foo: 'bar, baz'


  it 'should normalize header with richly typed value', ->
    assert.deepEqual headers(Foo: types.number.parse('10')), Foo: '10'
    assert.deepEqual headers(Foo: types.phone.parse('512-789-1111')), Foo: '5127891111'
