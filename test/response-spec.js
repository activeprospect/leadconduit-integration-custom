const { assert } = require('chai');
const xmlbuilder = require('xmlbuilder');
const response = require('../lib/response');

describe('Response', function() {


  describe('with json body', function() {

    it('should default to success without search term', function() {
      const expected = {
        outcome: 'success',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({}, {}, json({foo: 'bar'})), expected);
    });


    it('should default to failure per outcome on match', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_on_match: 'failure'}, {}, json({foo: 'bar'})), expected);
    });


    it('should find search term with exact match', function() {
      const expected = {
        outcome: 'success',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, json({foo: 'bar'})), expected);
    });


    it('should find search term with exact match at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'foo'}})), expected);
    });


    it('should not find search term', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'bip'}, {}, json({foo: 'bar'})), expected);
    });


    it('should not find search term at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'bip', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'foo'}})), expected);
    });


    it('should not find search term at different path', function() {
      const expected = {
        outcome: 'failure',
        x: 'bip',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'bip', outcome_search_path: 'baz.bip'}, {}, json({x: 'bip', baz: { bip: 'foo'}})), expected);
    });


    it('should failure on match per outcome on match', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure'}, {}, json({foo: 'bar'})), expected);
    });


    it('should failure on match per outcome on match at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'foo'}})), expected);
    });


    it('should find search term with partial match', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bip',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, json({barfoobaz: 'bip'})), expected);
    });


    it('should find search term with partial match at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should find search term with regex', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}'}, {}, json({barfoobaz: 'bar'})), expected);
    });


    it('should find search term with regex at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should find search term with regex including slashes', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/'}, {}, json({barfoobaz: 'bar'})), expected);
    });


    it('should find search term with regex with slashes at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should not error on invalid regex search term', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[/'}, {}, json({baz: { bip: 'foo'}})), expected);
    });


    it('should not error on invalid regex search term at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[/', outcome_search_path: 'baz.bip'}, {}, json({baz: { bip: 'foo'}})), expected);
    });


    it('should find search term with case insensitive match', function() {
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, json({baz: 'FOO'})), {outcome: 'success', baz: 'FOO', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO'}, {}, json({baz: 'foo'})), {outcome: 'success', baz: 'foo', price: 0});
    });


    it('should find search term with case insensitive match at path', function() {
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'baz'}, {}, json({baz: 'FOO'})), {outcome: 'success', baz: 'FOO', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO', outcome_search_path: 'baz'}, {}, json({baz: 'foo'})), {outcome: 'success', baz: 'foo', price: 0});
    });


    it('should not find match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, json({baz: 'bar'})), {outcome: 'failure', baz: 'bar', price: 0}));


    it('should not find match at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'bar' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, json({baz: { bip: 'bar' }})), expected);
    });


    it('should parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'baz.bip'
      };
      const expected = {
        outcome: 'failure',
        reason: 'the reason text!',
        baz: { bip: 'the reason text!' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: 'the reason text!'}})), expected);
    });


    it('should discard empty reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'baz.bip'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: '' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: ''}})), expected);
    });


    it('should discard whitespace reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'baz.bip'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: '     ' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: '     '}})), expected);
    });


    it('should parse multiple reasons', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'baz.bip'
      };
      const expected = {
        outcome: 'failure',
        reason: 'another reason, the reason text!',
        baz: { bip: ['the reason text!', 'another reason'] },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: ['the reason text!', 'another reason']}})), expected);
    });


    it('should parse single reason from array', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'baz.bip.1'
      };
      const expected = {
        outcome: 'failure',
        reason: 'another reason',
        baz: { bip: ['the reason text!', 'another reason'] },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: ['the reason text!', 'another reason']}})), expected);
    });


    it('should parse reason from array response', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '0.bip'
      };
      const expected = {
        outcome: 'failure',
        reason: 'the reason text!',
        price: 0
      };
      assert.deepEqual(response(vars, {}, json( [ {bip: 'the reason text!'} ] )), expected);
    });


    it('should default reason', function() {
      const expected = {
        outcome: 'success',
        reason: 'just because',
        baz: 'bip',
        price: 0
      };
      assert.deepEqual(response({default_reason: 'just because'}, {}, json({baz: 'bip'})), expected);
    });


    it('should fail to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'baz.baz.baz'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: 'foo' }})), expected);
    });


    it('should use default reason on failure to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'baz.baz.baz',
        default_reason: 'just because'
      };
      const expected = {
        outcome: 'failure',
        reason: 'just because',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { bip: 'foo' }})), expected);
    });

    it('should successfully parse reason with wildcard in path', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'baz.*.details'
      };
      const expected = {
        outcome: 'failure',
        reason: 'bad data',
        baz: {
          foo: {
            details: 'bad data'
          }
        },
        price: 0
      };
      assert.deepEqual(response(vars, {}, json({baz: { foo: { details: 'bad data' }}})), expected);
    });

    it('should successfully parse reason with multiple wildcards in path', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'baz.*.details.*.more_details'
      };
      const expected = {
        outcome: 'failure',
        reason: 'really bad data',
        baz: {
          foo: {
            details: {
              bip: {
                more_details: 'really bad data'
              }
            }
          }
        },
        price: 0
      };
         
      assert.deepEqual(response(vars, {}, json({baz: { foo: { details: { bip: { more_details : 'really bad data'}}}}})), expected);
    });


    it('should revert to string search on non-JSON body', function() {
      const vars = {outcome_search_term: 'bar'};
      const res = xml({foo: 'bar'});
      res.headers['Content-Type'] = 'application/json';
      assert.deepEqual(response(vars, {}, res).outcome, 'success');
    });


    it('should revert to regex on non-JSON body', function() {
      const res = {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        },
        body: '{"err":1,"message":"PhoneNumber is a required field."}'
      };
      assert.equal(response({reason_path: '"message":"([^"]+)"'}, {}, res).reason, 'PhoneNumber is a required field.');
    });

    it('should override response Content-Type if override is specified in vars', function() {
      const res = {
        status: 422,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        },
        body: '{"err":1,"message":"PhoneNumber is a required field."}'
      };
      const vars = {
        outcome_search_term: 'success',
        response_content_type_override: 'application/json',
        reason_path: 'message'
      };
      const expected = {
        outcome: 'failure',
        err: 1,
        message: "PhoneNumber is a required field.",
        reason: "PhoneNumber is a required field.",
        price: 0
      };
      assert.deepEqual(response(vars, {}, res), expected);
    });

    it('should capture price on success', function() {
      const vars = 
        {price_path: 'baz.*.cost'};
      const expected = {
        outcome: 'success',
        price: '1.5',
        baz: {
          foo: {
            cost: 1.5
          }
        }
      };
      assert.deepEqual(response(vars, {}, json({baz: { foo: { cost: 1.5 }}})), expected);
    });
    
    it('should capture price on success with outcome_search_term', function() {
      const vars = { 
        price_path: 'price',
        outcome_search_term: 'success'
      };
      const expected = {
        outcome: 'success',
        price: '18',
        status: 'success',
        auth_code: 'abc=='
      };
      assert.deepInclude(response(vars, {}, json({ status:"success", price:18, auth_code:"abc==" })), expected);
    });
  });

 

  describe('with plain text body', function() {

    it('should include response body in event object', () => assert.deepEqual(response({}, {}, text('foo')), {outcome: 'success', price: 0}));


    it('should default to success without search term', () => assert.deepEqual(response({}, {}, text('foo')).outcome, 'success'));


    it('should default to failure per outcome on match', () => assert.deepEqual(response({outcome_on_match: 'failure'}, {}, text('foo')).outcome, 'failure'));


    it('should find search term with exact match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, text('foo')).outcome, 'success'));


    it('should not find search term', () => assert.deepEqual(response({outcome_search_term: 'bip'}, {}, text('foo')).outcome, 'failure'));


    it('should failure on match per outcome on match', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure'}, {}, text('foo')).outcome, 'failure'));


    it('should find search term with partial match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, text('barfoobaz')).outcome, 'success'));


    it('should find search term with regex', () => assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}'}, {}, text('barfoobaz')).outcome, 'success'));


    it('should find search term with regex including slashes', () => assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/'}, {}, text('barfoobaz')).outcome, 'success'));


    it('should not error on invalid regex search term', () => assert.deepEqual(response({outcome_search_term: '/[/'}, {}, text('foo')).outcome, 'failure'));


    it('should find search term with case insensitve match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, text('FOO')).outcome, 'success'));


    it('should not find match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, text('bar')).outcome, 'failure'));


    it('should parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '[a-z]+:(.*)'
      };
      assert.deepEqual(response(vars, {}, text('bad:the reason text!')), {outcome: 'failure', reason: 'the reason text!', price: 0});
    });


    it('should parse reason with slashes', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '/[a-z]+:(.*)/'
      };
      assert.deepEqual(response(vars, {}, text('bad:the reason text!')), {outcome: 'failure', reason: 'the reason text!', price: 0});
    });


    it('should discard empty reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '[a-z]+:(.*)'
      };
      assert.deepEqual(response(vars, {}, text('bad:')), {outcome: 'failure', price: 0});
      assert.deepEqual(response(vars, {}, text('bad:     ')), {outcome: 'failure', price: 0});
    });


    it('should default reason', () => assert.deepEqual(response({default_reason: 'just because'}, {}, text('foo')).reason, 'just because'));


    it('should fail to parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'whatever:(.*)'
      };
      assert.deepEqual(response(vars, {}, text('bad:the reason text!')), {outcome: 'failure', price: 0});
    });


    it('should use default reason on failure to parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'whatever:(.*)',
        default_reason: 'just because'
      };
      assert.deepEqual(response(vars, {}, text('bad:the reason text!')), {outcome: 'failure', reason: 'just because', price: 0});
    });


    it('should use capture groups', function() {
      const vars = {
        outcome_on_match: 'failure',
        capture: {
          bad: '/bad: (.*)$/m',
          why: '/why: (.*)$/m'
        }
      };
      const expected = {
        outcome: 'failure',
        bad: 'the reason text!',
        why: 'just because',
        price: 0
      };

      assert.deepEqual(response(vars, {}, text('bad: the reason text!\nwhy: just because')), expected);
    });


    it('should not choke on bad capture group', function() {
      const vars = {
        outcome_on_match: 'failure',
        capture: {
          bad: '/bad: (.*/x'
        }
      };
      assert.deepEqual(response(vars, {}, text('bad: the reason text!\nwhy: just because')), {outcome: 'failure', price: 0});
    });


    it('should revert to string search on non-text body', function() {
      const vars = {outcome_search_term: 'bar'};
      const res = json({foo: 'bar'});
      res.headers['Content-Type'] = 'plain/text';
      assert.deepEqual(response(vars, {}, res).outcome, 'success');
    });

    it('should capture price when vars.cost is present', function() {
      const vars = 
        {price_path: '/cost=([0-9]\.[0-9])/'};
      const expected = { 
        outcome: 'success',
        price: '1.5'
      };
      assert.deepEqual(response(vars, {}, text('foo&cost=1.5')), expected);
    });
  });

  describe('with html', function() {

    it('should default to success without search term', () => assert.deepEqual(response({}, {}, html('<div>foo</div>')), {outcome: 'success', price: 0}));


    it('should default to failure per outcome on match', () => assert.deepEqual(response({outcome_on_match: 'failure'}, {}, html('<div>foo</div>')), {outcome: 'failure', price: 0}));


    it('should find search term with exact match', function() {
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('<div>foo</div>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('<foo>bar</foo>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('<div id="foo">bar</div>')), {outcome: 'success', price: 0});
    });


    it('should find search term with exact match at path', function() {
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>foo</div>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div span'}, {}, html('<div><span>foo</span></foo>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div[id="bar"]'}, {}, html('<div id="bar">foo</div>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>bar</div><div>foo</div>')), {outcome: 'success', price: 0});
    });


    it('should not find search term', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('<div>bar</div>')), {outcome: 'failure', price: 0}));


    it('should not find search term at path', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>bar</div>')), {outcome: 'failure', price: 0}));


    it('should not find search term at different path', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div[id="one"]'}, {}, html('<div id="one">bar</div><div id="other">foo</div>')), {outcome: 'failure', price: 0}));


    it('should failure on match per outcome on match', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure'}, {}, html('<div>foo</div>')), {outcome: 'failure', price: 0}));


    it('should failure on match per outcome on match at path', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: 'div'}, {}, html('<div>foo</div>')), {outcome: 'failure', price: 0}));


    it('should find search term with partial match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('barfoobaz')), {outcome: 'success', price: 0}));


    it('should find search term with partial match at path', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>barfoobaz</div>')), {outcome: 'success', price: 0}));


    it('should find search term with regex', () => assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}'}, {}, html('bazfoobar')), {outcome: 'success', price: 0}));


    it('should find search term with regex at path', () => assert.deepEqual(response({outcome_search_term: 'id="[a-z]+">foo<', outcome_search_path: 'body'}, {}, html('<div id="bar">foo</div>')), {outcome: 'success', price: 0}));


    it('should find search term with regex including slashes', () => assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/'}, {}, html('bazfoobar')), {outcome: 'success', price: 0}));


    it('should find search term with regex including slashes at path', () => assert.deepEqual(response({outcome_search_term: '/id="[a-z]+">foo</', outcome_search_path: 'body'}, {}, html('<div id="bar">foo</div>')), {outcome: 'success', price: 0}));


    it('should not error on invalid regex search term', () => assert.deepEqual(response({outcome_search_term: '/[/'}, {}, html('foo')), {outcome: 'failure', price: 0}));


    it('should not error on invalid regex search term at path', () => assert.deepEqual(response({outcome_search_term: '/[/', outcome_search_path: 'div'}, {}, html('<div>foo</div>')), {outcome: 'failure', price: 0}));


    it('should find search term with case insensitive match', function() {
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('FOO')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO'}, {}, html('foo')), {outcome: 'success', price: 0});
    });


    it('should find search term with case insensitive match at path', function() {
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>FOO</div>')), {outcome: 'success', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO', outcome_search_path: 'div'}, {}, html('<div>foo</div>')), {outcome: 'success', price: 0});
    });


    it('should not find match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, html('baz')), {outcome: 'failure', price: 0}));


    it('should not find match at path', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<div>baz</div>')), {outcome: 'failure', price: 0}));


    it('should not error on broken html', () => assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: 'div'}, {}, html('<dibaz</div>')), {outcome: 'failure', price: 0}));


    it('should parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'div[id="message"]'
      };
      const expected = {
        outcome: 'failure',
        reason: 'just because',
        price: 0
      };
      assert.deepEqual(response(vars, {}, html('<div>bar</div><div id="message">just because</div>')), expected);
    });


    it('should parse reason from attribute', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '#message @reason'
      };
      const expected = {
        outcome: 'failure',
        reason: 'just because',
        price: 0
      };
      assert.deepEqual(response(vars, {}, html('<div>bar</div><div id="message" reason="just because"></div>')), expected);
    });


    it('should discard empty reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'div[id="message"]'
      };
      assert.deepEqual(response(vars, {}, html('<div>bar</div><div id="message"></div>')), {outcome: 'failure', price: 0});
    });


    it('should discard whitespace reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'div[id="message"]'
      };
      assert.deepEqual(response(vars, {}, html('<div>bar</div><div id="message">      </div>')), {outcome: 'failure', price: 0});
    });


    it('should parse multiple reasons', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: 'div.message'
      };
      const expected = {
        outcome: 'failure',
        reason: 'another reason, the reason text!',
        price: 0
      };
      assert.deepEqual(response(vars, {}, html('<div class="message">the reason text!</div><div class="message">another reason</div>')), expected);
    });


    it('should default reason', function() {
      const expected = {
        outcome: 'success',
        reason: 'just because',
        price: 0
      };
      assert.deepEqual(response({default_reason: 'just because'}, {}, html()), expected);
    });


    it('should fail to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'div.message'
      };
      assert.deepEqual(response(vars, {}, html('foo')), {outcome: 'failure', price: 0});
    });


    it('should use default reason on failure to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: 'div.message',
        default_reason: 'just because'
      };
      assert.deepEqual(response(vars, {}, html('foo')), {outcome: 'failure', reason: 'just because', price: 0});
    });


    it('should revert to string search on non-HTML body', function() {
      const vars = {outcome_search_term: 'bar'};
      const res = json({foo: 'bar'});
      res.headers['Content-Type'] = 'text/html';
      assert.deepEqual(response(vars, {}, res).outcome, 'success');
    });


    it('should use capture groups', function() {
      const vars = {
        capture: {
          number_records: 'matched (.*) records'
        }
      };
      const expected = {
        outcome: 'success',
        number_records: '42',
        price: 0
      };
      assert.deepEqual(response(vars, {}, html('<div>result: matched 42 records.</div>')), expected);
    });

    it('should capture price when price_path is present', function() {
      const vars =
        {price_path: 'div.cost'};
      const expected = { 
        outcome: 'success',
        price: "1.5"
      };
      assert.deepEqual(response(vars, {}, html('<div class="cost">1.5</div>')), expected);
    });
  });

  describe('with xml body', function() {

    it('should default to success without search term', function() {
      const expected = {
        outcome: 'success',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({}, {}, xml({foo: 'bar'})), expected);
    });


    it('should default to failure per outcome on match', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_on_match: 'failure'}, {}, xml({foo: 'bar'})), expected);
    });


    it('should find search term with exact match', function() {
      const expected = {
        outcome: 'success',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, xml({foo: 'bar'})), expected);
    });


    it('should find search term with exact match at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'foo'}})), expected);
    });


    it('should not find search term', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'bip'}, {}, xml({foo: 'bar'})), expected);
    });


    it('should not find search term at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'bip', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'foo'}})), expected);
    });


    it('should not find search term at different path', function() {
      const expected = {
        outcome: 'failure',
        price: 0,
        y: {
          x: 'bip',
          baz: { bip: 'foo' }
        }
      };
      assert.deepEqual(response({outcome_search_term: 'bip', outcome_search_path: '/baz/bip/text()'}, {}, xml({y: { x: 'bip', baz: { bip: 'foo'}}})), expected);
    });


    it('should failure on match per outcome on match', function() {
      const expected = {
        outcome: 'failure',
        foo: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure'}, {}, xml({foo: 'bar'})), expected);
    });


    it('should failure on match per outcome on match at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_on_match: 'failure', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'foo'}})), expected);
    });


    it('should find search term with partial match', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bip',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, xml({barfoobaz: 'bip'})), expected);
    });


    it('should find search term with partial match at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should find search term with regex', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}'}, {}, xml({barfoobaz: 'bar'})), expected);
    });


    it('should find search term with regex at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '[a-z]{3}foo[a-z]{3}', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should find search term with regex including slashes', function() {
      const expected = {
        outcome: 'success',
        barfoobaz: 'bar',
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/'}, {}, xml({barfoobaz: 'bar'})), expected);
    });


    it('should find search term with regex with slashes at path', function() {
      const expected = {
        outcome: 'success',
        baz: { bip: 'barfoobaz' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[a-z]{3}foo[a-z]{3}/', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'barfoobaz' }})), expected);
    });


    it('should not error on invalid regex search term', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[/'}, {}, xml({baz: { bip: 'foo'}})), expected);
    });


    it('should not error on invalid regex search term at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: '/[/', outcome_search_path: '/baz/bip/text()'}, {}, xml({baz: { bip: 'foo'}})), expected);
    });


    it('should find search term with case insensitive match', function() {
      assert.deepEqual(response({outcome_search_term: 'foo'}, {}, xml({baz: 'FOO'})), {outcome: 'success', baz: 'FOO', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO'}, {}, xml({baz: 'foo'})), {outcome: 'success', baz: 'foo', price: 0});
    });


    it('should find search term with case insensitive match at path', function() {
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: '/baz'}, {}, xml({baz: 'FOO'})), {outcome: 'success', baz: 'FOO', price: 0});
      assert.deepEqual(response({outcome_search_term: 'FOO', outcome_search_path: '/baz'}, {}, xml({baz: 'foo'})), {outcome: 'success', baz: 'foo', price: 0});
    });


    it('should not find match', () => assert.deepEqual(response({outcome_search_term: 'foo'}, {}, xml({baz: 'bar'})), {outcome: 'failure', baz: 'bar', price: 0}));


    it('should not find match at path', function() {
      const expected = {
        outcome: 'failure',
        baz: { bip: 'bar' },
        price: 0
      };
      assert.deepEqual(response({outcome_search_term: 'foo', outcome_search_path: '/bip/text()'}, {}, xml({baz: { bip: 'bar' }})), expected);
    });


    it('should parse reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '/baz/bip/text()'
      };
      const expected = {
        outcome: 'failure',
        reason: 'the reason text!',
        baz: { bip: 'the reason text!' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: 'the reason text!'}})), expected);
    });


    it('should parse reason from CDATA', function() {
      const vars = {
        outcome_search_term: 'success',
        reason_path: '/baz/bip/text()'
      };

      const body = '<baz><bip><![CDATA[the reason character data!]]></bip></baz>';

      const res = {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
          'Content-Length': body.length
        },
        body
      };

      const expected = {
        outcome: 'failure',
        reason: 'the reason text!'
      };

      const event = response(vars, {}, res);
      assert.equal(event.outcome, 'failure');
      assert.equal(event.reason, 'the reason character data!');
    });


    it('should discard empty reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '/baz/bip/text()'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: '' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: ''}})), expected);
    });


    it('should discard whitespace reason', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '/baz/bip/text()'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: '     ' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: '     '}})), expected);
    });


    it('should parse multiple reasons', function() {
      const vars = {
        outcome_search_term: 'foo',
        reason_path: '//bip/text()'
      };
      const expected = {
        outcome: 'failure',
        reason: 'another reason, the reason text!',
        baz: { bip: ['the reason text!', 'another reason'] },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: ['the reason text!', 'another reason']}})), expected);
    });


    it('should default reason', function() {
      const expected = {
        outcome: 'success',
        reason: 'just because',
        baz: 'bip',
        price: 0
      };
      assert.deepEqual(response({default_reason: 'just because'}, {}, xml({baz: 'bip'})), expected);
    });


    it('should fail to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: '/baz/baz/baz/text()'
      };
      const expected = {
        outcome: 'failure',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: 'foo' }})), expected);
    });


    it('should use default reason on failure to parse reason', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: '/baz/baz/baz/text()',
        default_reason: 'just because'
      };
      const expected = {
        outcome: 'failure',
        reason: 'just because',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: 'foo' }})), expected);
    });


    it('should use default reason on failure with invalid reason selector', function() {
      const vars = {
        outcome_search_term: 'bar',
        reason_path: '[[[[[   ',
        default_reason: 'just because'
      };
      const expected = {
        outcome: 'failure',
        reason: 'just because',
        baz: { bip: 'foo' },
        price: 0
      };
      assert.deepEqual(response(vars, {}, xml({baz: { bip: 'foo' }})), expected);
    });


    it('should revert to string search on non-XML body', function() {
      const vars = {outcome_search_term: 'bar'};
      const res = json({foo: { bar: 'baz'}});
      res.headers['Content-Type'] = 'text/xml';
      assert.deepEqual(response(vars, {}, res), {outcome: 'success', price: 0});
    });

    it('should capture price', function() {
      const vars =
        {price_path: 'bar/cost/text()'};
      const expected = {
        price: '1.5',
        bar: {
          cost: '1.5'
        },
        outcome: 'success'
      };
      assert.deepEqual(response(vars, {}, xml({bar: { cost: '1.5'}})), expected);
    });
  });

  describe('HTTP status code', function() {

    it('should error on HTTP 500', function() {
      const res = {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': 6
        },
        body: 'oh no!'
      };
      assert.deepEqual(response({}, {}, res), {outcome: 'error', reason: 'Server error'});
    });


    it('should error on HTTP 502', function() {
      const res = {
        status: 599,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': 6
        },
        body: 'oh no!'
      };
      assert.deepEqual(response({}, {}, res), {outcome: 'error', reason: 'Server error'});
    });


    it('should error on HTTP 599', function() {
      const res = {
        status: 599,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': 6
        },
        body: 'oh no!'
      };
      assert.deepEqual(response({}, {}, res), {outcome: 'error', reason: 'Server error'});
    });


    it('should not error on HTTP 400', function() {
      const res = {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': 6
        },
        body: 'oh no!'
      };
      assert.deepEqual(response({}, {}, res).outcome, 'success');
    });

    it('should success on HTTP 200 if no outcome and search term are specified', function() {
      const res = {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Length': 0
        },
        body: ''
      };
      assert.deepEqual(response({outcome_search_term: null, outcome_on_match: null}, {}, res).outcome, 'success');
    });
  });

  describe('cookie capture', function() {

    before(function() {
      this.cookie = 'Session_id=678; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly';
      this.res = {
        status: 200,
        headers: {
          'Set-Cookie': this.cookie
        }
      };
    });

    it('should not capture anything with no search-term', function() {
      assert.deepEqual(response({}, {}, this.res), {outcome: 'success', price: 0});
    });


    it('should not capture anything when search-term does not match', function() {
      assert.deepEqual(response({cookie_search_term: 'login_info'}, {}, this.res), {outcome: 'success', price: 0});
    });


    it('should not capture anything when regex search-term does not match', function() {
      assert.deepEqual(response({cookie_search_term: 'domain=.x[0-9]{7}'}, {}, this.res), {outcome: 'success', price: 0});
    });


    it('should capture a cookie that matches string search-term', function() {
      assert.deepEqual(response({cookie_search_term: 'session_id'}, {}, this.res), {outcome: 'success', cookie: this.cookie, price: 0});
    });


    it('should capture a cookie regardless of search-term case', function() {
      assert.deepEqual(response({cookie_search_term: 'session_id'}, {}, this.res), {outcome: 'success', cookie: this.cookie, price: 0});
      assert.deepEqual(response({cookie_search_term: 'SESSION_ID'}, {}, this.res), {outcome: 'success', cookie: this.cookie, price: 0});
    });


    it('should capture a cookie that matches regex search-term', function() {
      assert.deepEqual(response({cookie_search_term: 'session.*domain=.fizzbuzz'}, {}, this.res), {outcome: 'success', cookie: this.cookie, price: 0});
    });


    it('should capture the first cookie (sorted lexicographically) when multiples match string search-term', function() {
      const cookie2 = 'Session_id=123; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly';
      const cookie3 = 'Session_id=9AB; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly';
      this.res.headers['Set-Cookie'] = [
        this.cookie,
        cookie2,
        cookie3
      ];
      assert.deepEqual(response({cookie_search_term: 'session_id'}, {}, this.res), {outcome: 'success', cookie: cookie2, price: 0});
    });

    it('should capture the first cookie (sorted lexicographically) when multiples match regex search-term', function() {
      const cookie2 = 'Session_id=123; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly';
      const cookie3 = 'Session_id=9AB; path=/; domain=.fizzbuzz.com; expires=Sat, 01-Jan-2022 16:39:03 GMT; Max-Age=155520000; secure; httpOnly';
      this.res.headers['Set-Cookie'] = [
        this.cookie,
        cookie2,
        cookie3
      ];
     assert.deepEqual(response({cookie_search_term: 'session.*domain=.fizzbuzz'}, {}, this.res), {outcome: 'success', cookie: cookie2, price: 0});
    });
  });
});


var xml = function(obj) {
  const body = xmlbuilder.create(obj).end({ pretty: true, indent: '  ', newline: '\n' });
  return {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': body.length
    },
    body
  };
};


var html = function(body) {
  body = `<html><body>${body}</body></html>`;
  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Content-Length': body.length
    },
    body
  };
};


var json = function(obj) {
  const body = JSON.stringify(obj, null, 2);
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    },
    body
  };
};


var text = body => ({
  status: 200,

  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': body.length
  },

  body
});
