assert = require('chai').assert
xmlbuilder = require('xmlbuilder')
response = require('../src/response')

describe 'Response', ->


  describe 'with json body', ->

    it 'should default to success without search term', ->
      expected =
        outcome: 'success'
        foo: 'bar'
      assert.deepEqual response({}, {}, json(foo: 'bar')), expected


    it 'should default to failure per outcome on match', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_on_match: 'failure', {}, json(foo: 'bar')), expected


    it 'should find search term with exact match', ->
      expected =
        outcome: 'success'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'foo', {}, json(foo: 'bar')), expected


    it 'should find search term with exact match at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'foo'})), expected


    it 'should not find search term', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'bip', {}, json(foo: 'bar')), expected


    it 'should not find search term at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'bip', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'foo'})), expected


    it 'should not find search term at different path', ->
      expected =
        outcome: 'failure'
        x: 'bip'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'bip', outcome_search_path: 'baz.bip', {}, json(x: 'bip', baz: { bip: 'foo'})), expected


    it 'should return failure on match per outcome on match', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', {}, json(foo: 'bar')), expected


    it 'should return failure on match per outcome on match at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'foo'})), expected


    it 'should find search term with partial match', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bip'
      assert.deepEqual response(outcome_search_term: 'foo', {}, json(barfoobaz: 'bip')), expected


    it 'should find search term with partial match at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'barfoobaz' })), expected


    it 'should find search term with regex', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bar'
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', {}, json(barfoobaz: 'bar')), expected


    it 'should find search term with regex at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'barfoobaz' })), expected


    it 'should find search term with regex including slashes', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bar'
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', {}, json(barfoobaz: 'bar')), expected


    it 'should find search term with regex with slashes at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'barfoobaz' })), expected


    it 'should not error on invalid regex search term', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: '/[/', {}, json(baz: { bip: 'foo'})), expected


    it 'should not error on invalid regex search term at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: '/[/', outcome_search_path: 'baz.bip', {}, json(baz: { bip: 'foo'})), expected


    it 'should find search term with case insensitive match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, json(baz: 'FOO')), outcome: 'success', baz: 'FOO'
      assert.deepEqual response(outcome_search_term: 'FOO', {}, json(baz: 'foo')), outcome: 'success', baz: 'foo'


    it 'should find search term with case insensitive match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'baz', {}, json(baz: 'FOO')), outcome: 'success', baz: 'FOO'
      assert.deepEqual response(outcome_search_term: 'FOO', outcome_search_path: 'baz', {}, json(baz: 'foo')), outcome: 'success', baz: 'foo'


    it 'should not find match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, json(baz: 'bar')), outcome: 'failure', baz: 'bar'


    it 'should not find match at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'bar' }
      assert.deepEqual response(outcome_search_term: 'foo', {}, json(baz: { bip: 'bar' })), expected


    it 'should parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'baz.bip'
      expected =
        outcome: 'failure'
        reason: 'the reason text!'
        baz: { bip: 'the reason text!' }
      assert.deepEqual response(vars, {}, json(baz: { bip: 'the reason text!'})), expected


    it 'should discard empty reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'baz.bip'
      expected =
        outcome: 'failure'
        baz: { bip: '' }
      assert.deepEqual response(vars, {}, json(baz: { bip: ''})), expected


    it 'should discard whitespace reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'baz.bip'
      expected =
        outcome: 'failure'
        baz: { bip: '     ' }
      assert.deepEqual response(vars, {}, json(baz: { bip: '     '})), expected


    it 'should parse multiple reasons', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'baz.bip'
      expected =
        outcome: 'failure'
        reason: 'another reason, the reason text!'
        baz: { bip: ['the reason text!', 'another reason'] }
      assert.deepEqual response(vars, {}, json(baz: { bip: ['the reason text!', 'another reason']})), expected


    it 'should return default reason', ->
      expected =
        outcome: 'success'
        reason: 'just because'
        baz: 'bip'
      assert.deepEqual response(default_reason: 'just because', {}, json(baz: 'bip')), expected


    it 'should fail to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: 'baz.baz.baz'
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(vars, {}, json(baz: { bip: 'foo' })), expected


    it 'should use default reason on failure to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: 'baz.baz.baz'
        default_reason: 'just because'
      expected =
        outcome: 'failure'
        reason: 'just because'
        baz: { bip: 'foo' }
      assert.deepEqual response(vars, {}, json(baz: { bip: 'foo' })), expected


    it 'should revert to string search on non-JSON body', ->
      vars = outcome_search_term: 'bar'
      res = xml(foo: 'bar')
      res.headers['Content-Type'] = 'application/json'
      assert.deepEqual response(vars, {}, res).outcome, 'success'


    it 'should revert to regex on non-JSON body', ->
      res =
        status: 200
        headers:
          'Content-Type': 'text/html; charset=UTF-8'
        body: '{"err":1,"message":"PhoneNumber is a required field."}'
      assert.equal response({reason_path: '"message":"([^"]+)"'}, {}, res).reason, 'PhoneNumber is a required field.'

    it 'should override response Content-Type if override is specified in vars', ->
      res =
        status: 422
        headers:
          'Content-Type': 'text/html; charset=UTF-8'
        body: '{"err":1,"message":"PhoneNumber is a required field."}'
      vars =
        outcome_search_term: 'success'
        response_content_type_override: 'application/json'
        reason_path: 'message'
      expected =
        outcome: 'failure'
        err: 1
        message: "PhoneNumber is a required field."
        reason: "PhoneNumber is a required field."
      assert.deepEqual response(vars, {}, res), expected


  describe 'with plain text body', ->

    it 'should include response body in event object', ->
      assert.deepEqual response({}, {}, text('foo')), outcome: 'success'


    it 'should default to success without search term', ->
      assert.deepEqual response({}, {}, text('foo')).outcome, 'success'


    it 'should default to failure per outcome on match', ->
      assert.deepEqual response(outcome_on_match: 'failure', {}, text('foo')).outcome, 'failure'


    it 'should find search term with exact match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, text('foo')).outcome, 'success'


    it 'should not find search term', ->
      assert.deepEqual response(outcome_search_term: 'bip', {}, text('foo')).outcome, 'failure'


    it 'should return failure on match per outcome on match', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', {}, text('foo')).outcome, 'failure'


    it 'should find search term with partial match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, text('barfoobaz')).outcome, 'success'


    it 'should find search term with regex', ->
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', {}, text('barfoobaz')).outcome, 'success'


    it 'should find search term with regex including slashes', ->
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', {}, text('barfoobaz')).outcome, 'success'


    it 'should not error on invalid regex search term', ->
      assert.deepEqual response(outcome_search_term: '/[/', {}, text('foo')).outcome, 'failure'


    it 'should find search term with case insensitve match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, text('FOO')).outcome, 'success'


    it 'should not find match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, text('bar')).outcome, 'failure'


    it 'should parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '[a-z]+:(.*)'
      assert.deepEqual response(vars, {}, text('bad:the reason text!')), outcome: 'failure', reason: 'the reason text!'


    it 'should parse reason with slashes', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '/[a-z]+:(.*)/'
      assert.deepEqual response(vars, {}, text('bad:the reason text!')), outcome: 'failure', reason: 'the reason text!'


    it 'should discard empty reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '[a-z]+:(.*)'
      assert.deepEqual response(vars, {}, text('bad:')), outcome: 'failure'
      assert.deepEqual response(vars, {}, text('bad:     ')), outcome: 'failure'


    it 'should return default reason', ->
      assert.deepEqual response(default_reason: 'just because', {}, text('foo')).reason, 'just because'


    it 'should fail to parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'whatever:(.*)'
      assert.deepEqual response(vars, {}, text('bad:the reason text!')), outcome: 'failure'


    it 'should use default reason on failure to parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'whatever:(.*)'
        default_reason: 'just because'
      assert.deepEqual response(vars, {}, text('bad:the reason text!')), outcome: 'failure', reason: 'just because'


    it 'should use capture groups', ->
      vars =
        outcome_on_match: 'failure'
        capture:
          bad: '/bad: (.*)$/m'
          why: '/why: (.*)$/m'
      expected =
        outcome: 'failure'
        bad: 'the reason text!'
        why: 'just because'

      assert.deepEqual response(vars, {}, text('bad: the reason text!\nwhy: just because')), expected


    it 'should not choke on bad capture group', ->
      vars =
        outcome_on_match: 'failure'
        capture:
          bad: '/bad: (.*/x'
      assert.deepEqual response(vars, {}, text('bad: the reason text!\nwhy: just because')), outcome: 'failure'


    it 'should revert to string search on non-text body', ->
      vars = outcome_search_term: 'bar'
      res = json(foo: 'bar')
      res.headers['Content-Type'] = 'plain/text'
      assert.deepEqual response(vars, {}, res).outcome, 'success'



  describe 'with html', ->

    it 'should default to success without search term', ->
      assert.deepEqual response({}, {}, html('<div>foo</div>')), outcome: 'success'


    it 'should default to failure per outcome on match', ->
      assert.deepEqual response(outcome_on_match: 'failure', {}, html('<div>foo</div>')), outcome: 'failure'


    it 'should find search term with exact match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('<div>foo</div>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('<foo>bar</foo>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('<div id="foo">bar</div>')), outcome: 'success'


    it 'should find search term with exact match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>foo</div>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div span', {}, html('<div><span>foo</span></foo>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div[id="bar"]', {}, html('<div id="bar">foo</div>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>bar</div><div>foo</div>')), outcome: 'success'


    it 'should not find search term', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('<div>bar</div>')), outcome: 'failure'


    it 'should not find search term at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>bar</div>')), outcome: 'failure'


    it 'should not find search term at different path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div[id="one"]', {}, html('<div id="one">bar</div><div id="other">foo</div>')), outcome: 'failure'


    it 'should return failure on match per outcome on match', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', {}, html('<div>foo</div>')), outcome: 'failure'


    it 'should return failure on match per outcome on match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: 'div', {}, html('<div>foo</div>')), outcome: 'failure'


    it 'should find search term with partial match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('barfoobaz')), outcome: 'success'


    it 'should find search term with partial match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>barfoobaz</div>')), outcome: 'success'


    it 'should find search term with regex', ->
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', {}, html('bazfoobar')), outcome: 'success'


    it 'should find search term with regex at path', ->
      assert.deepEqual response(outcome_search_term: 'id="[a-z]+">foo<', outcome_search_path: 'body', {}, html('<div id="bar">foo</div>')), outcome: 'success'


    it 'should find search term with regex including slashes', ->
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', {}, html('bazfoobar')), outcome: 'success'


    it 'should find search term with regex including slashes at path', ->
      assert.deepEqual response(outcome_search_term: '/id="[a-z]+">foo</', outcome_search_path: 'body', {}, html('<div id="bar">foo</div>')), outcome: 'success'


    it 'should not error on invalid regex search term', ->
      assert.deepEqual response(outcome_search_term: '/[/', {}, html('foo')), outcome: 'failure'


    it 'should not error on invalid regex search term at path', ->
      assert.deepEqual response(outcome_search_term: '/[/', outcome_search_path: 'div', {}, html('<div>foo</div>')), outcome: 'failure'


    it 'should find search term with case insensitive match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('FOO')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'FOO', {}, html('foo')), outcome: 'success'


    it 'should find search term with case insensitive match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>FOO</div>')), outcome: 'success'
      assert.deepEqual response(outcome_search_term: 'FOO', outcome_search_path: 'div', {}, html('<div>foo</div>')), outcome: 'success'


    it 'should not find match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, html('baz')), outcome: 'failure'


    it 'should not find match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<div>baz</div>')), outcome: 'failure'


    it 'should not error on broken html', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: 'div', {}, html('<dibaz</div>')), outcome: 'failure'


    it 'should parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'div[id="message"]'
      expected =
        outcome: 'failure'
        reason: 'just because'
      assert.deepEqual response(vars, {}, html('<div>bar</div><div id="message">just because</div>')), expected


    it 'should parse reason from attribute', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '#message @reason'
      expected =
        outcome: 'failure'
        reason: 'just because'
      assert.deepEqual response(vars, {}, html('<div>bar</div><div id="message" reason="just because"></div>')), expected


    it 'should discard empty reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'div[id="message"]'
      assert.deepEqual response(vars, {}, html('<div>bar</div><div id="message"></div>')), outcome: 'failure'


    it 'should discard whitespace reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'div[id="message"]'
      assert.deepEqual response(vars, {}, html('<div>bar</div><div id="message">      </div>')), outcome: 'failure'


    it 'should parse multiple reasons', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: 'div.message'
      expected =
        outcome: 'failure'
        reason: 'another reason, the reason text!'
      assert.deepEqual response(vars, {}, html('<div class="message">the reason text!</div><div class="message">another reason</div>')), expected


    it 'should return default reason', ->
      expected =
        outcome: 'success'
        reason: 'just because'
      assert.deepEqual response(default_reason: 'just because', {}, html()), expected


    it 'should fail to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: 'div.message'
      assert.deepEqual response(vars, {}, html('foo')), outcome: 'failure'


    it 'should use default reason on failure to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: 'div.message'
        default_reason: 'just because'
      assert.deepEqual response(vars, {}, html('foo')), outcome: 'failure', reason: 'just because'


    it 'should revert to string search on non-HTML body', ->
      vars = outcome_search_term: 'bar'
      res = json(foo: 'bar')
      res.headers['Content-Type'] = 'text/html'
      assert.deepEqual response(vars, {}, res).outcome, 'success'


    it 'should use capture groups', ->
      vars =
        capture:
          number_records: 'matched (.*) records'
      expected =
        outcome: 'success'
        number_records: '42'

      assert.deepEqual response(vars, {}, html('<div>result: matched 42 records.</div>')), expected


  describe 'with xml body', ->

    it 'should default to success without search term', ->
      expected =
        outcome: 'success'
        foo: 'bar'
      assert.deepEqual response({}, {}, json(foo: 'bar')), expected


    it 'should default to failure per outcome on match', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_on_match: 'failure', {}, xml(foo: 'bar')), expected


    it 'should find search term with exact match', ->
      expected =
        outcome: 'success'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'foo', {}, xml(foo: 'bar')), expected


    it 'should find search term with exact match at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'foo'})), expected


    it 'should not find search term', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'bip', {}, xml(foo: 'bar')), expected


    it 'should not find search term at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'bip', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'foo'})), expected


    it 'should not find search term at different path', ->
      expected =
        outcome: 'failure'
        y:
          x: 'bip'
          baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'bip', outcome_search_path: '/baz/bip/text()', {}, xml(y: { x: 'bip', baz: { bip: 'foo'}})), expected


    it 'should return failure on match per outcome on match', ->
      expected =
        outcome: 'failure'
        foo: 'bar'
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', {}, xml(foo: 'bar')), expected


    it 'should return failure on match per outcome on match at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'foo'})), expected


    it 'should find search term with partial match', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bip'
      assert.deepEqual response(outcome_search_term: 'foo', {}, xml(barfoobaz: 'bip')), expected


    it 'should find search term with partial match at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'barfoobaz' })), expected


    it 'should find search term with regex', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bar'
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', {}, xml(barfoobaz: 'bar')), expected


    it 'should find search term with regex at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: '[a-z]{3}foo[a-z]{3}', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'barfoobaz' })), expected


    it 'should find search term with regex including slashes', ->
      expected =
        outcome: 'success'
        barfoobaz: 'bar'
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', {}, xml(barfoobaz: 'bar')), expected


    it 'should find search term with regex with slashes at path', ->
      expected =
        outcome: 'success'
        baz: { bip: 'barfoobaz' }
      assert.deepEqual response(outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'barfoobaz' })), expected


    it 'should not error on invalid regex search term', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: '/[/', {}, xml(baz: { bip: 'foo'})), expected


    it 'should not error on invalid regex search term at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(outcome_search_term: '/[/', outcome_search_path: '/baz/bip/text()', {}, xml(baz: { bip: 'foo'})), expected


    it 'should find search term with case insensitive match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, xml(baz: 'FOO')), outcome: 'success', baz: 'FOO'
      assert.deepEqual response(outcome_search_term: 'FOO', {}, xml(baz: 'foo')), outcome: 'success', baz: 'foo'


    it 'should find search term with case insensitive match at path', ->
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: '/baz', {}, xml(baz: 'FOO')), outcome: 'success', baz: 'FOO'
      assert.deepEqual response(outcome_search_term: 'FOO', outcome_search_path: '/baz', {}, xml(baz: 'foo')), outcome: 'success', baz: 'foo'


    it 'should not find match', ->
      assert.deepEqual response(outcome_search_term: 'foo', {}, xml(baz: 'bar')), outcome: 'failure', baz: 'bar'


    it 'should not find match at path', ->
      expected =
        outcome: 'failure'
        baz: { bip: 'bar' }
      assert.deepEqual response(outcome_search_term: 'foo', outcome_search_path: '/bip/text()', {}, xml(baz: { bip: 'bar' })), expected


    it 'should parse reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '/baz/bip/text()'
      expected =
        outcome: 'failure'
        reason: 'the reason text!'
        baz: { bip: 'the reason text!' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: 'the reason text!'})), expected


    it 'should parse reason from CDATA', ->
      vars =
        outcome_search_term: 'success'
        reason_path: '/baz/bip/text()'

      body = '<baz><bip><![CDATA[the reason character data!]]></bip></baz>'

      res =
        status: 200
        headers:
          'Content-Type': 'text/xml'
          'Content-Length': body.length
        body: body

      expected =
        outcome: 'failure'
        reason: 'the reason text!'

      event = response(vars, {}, res)
      assert.equal event.outcome, 'failure'
      assert.equal event.reason, 'the reason character data!'


    it 'should discard empty reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '/baz/bip/text()'
      expected =
        outcome: 'failure'
        baz: { bip: '' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: ''})), expected


    it 'should discard whitespace reason', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '/baz/bip/text()'
      expected =
        outcome: 'failure'
        baz: { bip: '     ' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: '     '})), expected


    it 'should parse multiple reasons', ->
      vars =
        outcome_search_term: 'foo'
        reason_path: '//bip/text()'
      expected =
        outcome: 'failure'
        reason: 'another reason, the reason text!'
        baz: { bip: ['the reason text!', 'another reason'] }
      assert.deepEqual response(vars, {}, xml(baz: { bip: ['the reason text!', 'another reason']})), expected


    it 'should return default reason', ->
      expected =
        outcome: 'success'
        reason: 'just because'
        baz: 'bip'
      assert.deepEqual response(default_reason: 'just because', {}, xml(baz: 'bip')), expected


    it 'should fail to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: '/baz/baz/baz/text()'
      expected =
        outcome: 'failure'
        baz: { bip: 'foo' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: 'foo' })), expected


    it 'should use default reason on failure to parse reason', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: '/baz/baz/baz/text()'
        default_reason: 'just because'
      expected =
        outcome: 'failure'
        reason: 'just because'
        baz: { bip: 'foo' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: 'foo' })), expected


    it 'should use default reason on failure with invalid reason selector', ->
      vars =
        outcome_search_term: 'bar'
        reason_path: '[[[[[   '
        default_reason: 'just because'
      expected =
        outcome: 'failure'
        reason: 'just because'
        baz: { bip: 'foo' }
      assert.deepEqual response(vars, {}, xml(baz: { bip: 'foo' })), expected


    it 'should revert to string search on non-XML body', ->
      vars = outcome_search_term: 'bar'
      res = json(foo: { bar: 'baz'})
      res.headers['Content-Type'] = 'text/xml'
      assert.deepEqual response(vars, {}, res), outcome: 'success'



  describe 'HTTP status code', ->

    it 'should error on HTTP 500', ->
      res =
        status: 500
        headers:
          'Content-Type': 'text/plain'
          'Content-Length': 6
        body: 'oh no!'
      assert.deepEqual response({}, {}, res), outcome: 'error', reason: 'Server error'


    it 'should error on HTTP 502', ->
      res =
        status: 599
        headers:
          'Content-Type': 'text/plain'
          'Content-Length': 6
        body: 'oh no!'
      assert.deepEqual response({}, {}, res), outcome: 'error', reason: 'Server error'


    it 'should error on HTTP 599', ->
      res =
        status: 599
        headers:
          'Content-Type': 'text/plain'
          'Content-Length': 6
        body: 'oh no!'
      assert.deepEqual response({}, {}, res), outcome: 'error', reason: 'Server error'


    it 'should not error on HTTP 400', ->
      res =
        status: 400
        headers:
          'Content-Type': 'text/plain'
          'Content-Length': 6
        body: 'oh no!'
      assert.deepEqual response({}, {}, res).outcome, 'success'

    it 'should return success on HTTP 200 if no outcome and search term are specified', ->
      res =
        status: 200
        headers:
          'Content-Type': 'text/html'
          'Content-Length': 0
        body: ''
      assert.deepEqual response({outcome_search_term: null, outcome_on_match: null}, {}, res).outcome, 'success'


  describe 'cookie handling', ->

    it 'should not capture response cookies if not requested by the user', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['session_id=12345; path=/; domain=.fizzbuzz.com']
      assert.deepEqual response({}, {}, res), outcome: "success"

    it 'should capture response cookies into named property if specified in vars, with proper types for each cookie attribute', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['session_id=12345; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly']
      vars = 
        collect_cookies: "cookie_monster"
      expected =
        "session_id":
          name: "session_id"
          value: "12345"
          path: "/"
          domain: ".fizzbuzz.com" #string
          expires: Date("Sat, 01-Jan-2022 16:39:03 GMT") #Date object
          maxAge: 155520000, #number
          secure: true, #boolean
          httpOnly: true
      assert.deepEqual response(vars, {}, res).cookie_monster, expected 

    it 'should handle multiple, unique cookies (cookies with distinct cookie-name)', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['foo=fizz','bar=buzz']
      vars = 
        collect_cookies: "cookie_monster"
      expected =
        "foo":
          "name": "foo"
          "value": "fizz"
        "bar":
          "name": "bar"
          "value": "buzz"
      assert.deepEqual response(vars, {}, res).cookie_monster, expected

    # RFC 6265 (4.1.1) says that multiple Set-Cookie headers with the same
    # cookie-name is a no-no. RFC 6265 (5.3) also states that in such cases,
    # the cookie user agents are to pick the latest Set-Cookie if more than
    # one cookie has the same (cookie-name, domain-value, path-value) tuple.
    # Otherwise, the user agent treats the two cookies (with same cookie-name)
    # as different cookies.

    it 'should handle multiple cookies with duplicate cookie-name, but different domain-value and/or path-value', ->
      # The top-level cookie object name will then reference an array of cookie
      # objects, rather than a cookie object directly.
      res =
        status: 200
        headers:
          'Set-Cookie': [
            'foo=fizz; path=/; domain=.fizzbuzz.com',
            'foo=buzz; path=/somepath; domain=.fizzbuzz.com'
          ]
      vars =
        collect_cookies: "cookie_monster"
      expected =
        "foo": [
          {"name":"fizz", "path":"/", "domain":".fizzbuzz.com"},
          {"name":"buzz", "path":"/somepath", "domain":".fizzbuzz.com"}
        ]
      assert.deepEqual response(vars, {}, res).cookie_monster, expected

    it 'should handle multiple cookies with duplicate cookie-name, domain-value, and path-value', ->
      # The last Set-Cookie in the headers takes precedent.
      res =
        status: 200
        headers:
          'Set-Cookie': [
            'session_id=12345; path=/; domain=.fizzbuzz.com',
            'session_id=54321; path=/; domain=.fizzbuzz.com'
          ]
      vars = 
        collect_cookies: "cookie_monster"
      expected =
        "session_id":
          name: "session_id"
          value: "54321"
          path: "/"
          domain: ".fizzbuzz.com"
      assert.deepEqual response(vars, {}, res).cookie_monster, expected 

    # RFC 6265 (4.1.1) specifies that arbitrary data in cookie-values SHOULD
    # be encoded, but makes no requirement on the type of encoding (it only
    # mentions Base64 as an example of an encoding). The grammar defined in
    # section 4.1.1 for "cookie-octet" lends itself to most users utilizing
    # the encodeURIComponent() function for the purpose of conforming to that
    # grammar. The MDN also recommends encodeURIComponent:
    #
    # https://developer.mozilla.org/en-US/docs/Web/API/document/cookie
    #
    # and most projects involving cookie handling also conform to this
    # convention (as does the underling set-cookie-parser library in use
    # here).

    it 'should URIdecode cookie-values by default', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['user_id=cookie_monster%40sesamestreet.com']
      vars = 
        collect_cookies: "cookie_monster"
      expected =
        "user_id":
          "name": "user_id"
          "value": "cookie_monster@sesamestreet.com"
      assert.deepEqual response(vars, {}, res).cookie_monster, expected

    it 'should fall back to non-decoded URI string if URIdecode fails (malformed URI)', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['foo=bar_%F']
      vars = 
        collect_cookies: "cookie_monster"
      expected =
        "foo":
          "name": "foo"
          "value": "bar_%F"
      assert.deepEqual response(vars, {}, res).cookie_monster, expected

    it 'should leave cookie-value undecoded if requested by user', ->
      res =
        status: 200
        headers:
          'Set-Cookie': ['user_id=foo%40bar.com']
      vars = 
        collect_cookies: "cookie_monster"
        collect_cookies_decode: false
      expected =
        "user_id":
          "name": "user_id"
          "value": "foo%40bar.com"
      assert.deepEqual response(vars, {}, res).cookie_monster, expected



xml = (obj) ->
  body = xmlbuilder.create(obj).end({ pretty: true, indent: '  ', newline: '\n' })
  status: 200
  headers:
    'Content-Type': 'text/xml'
    'Content-Length': body.length
  body: body


html = (body) ->
  body = "<html><body>#{body}</body></html>"
  status: 200
  headers:
    'Content-Type': 'text/html'
    'Content-Length': body.length
  body: body


json = (obj) ->
  body = JSON.stringify(obj, null, 2)
  status: 200
  headers:
    'Content-Type': 'application/json'
    'Content-Length': body.length
  body: body


text = (body) ->
  status: 200
  headers:
    'Content-Type': 'text/plain'
    'Content-Length': body.length
  body: body
