const { assert } = require('chai');
const integration = require('../lib/query');
const types = require('leadconduit-types');


describe('Outbound GET Query request', function() {

  it('should have url, method, and headers', function() {
    const vars = {
      url: 'http://foo.bar',
      parameter: {
        fname: 'Mel',
        lname: 'Gibson'
      },
      header: {
        Whatever: 'foo'
      }
    };

    assert.equal(integration.request(vars).url, 'http://foo.bar?fname=Mel&lname=Gibson');
    assert.equal(integration.request(vars).method, 'GET');
    assert.deepEqual(integration.request(vars).headers, {
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5',
      'Whatever': 'foo'
    }
    );
  });


  it('should send data as ASCII when told to', function() {
    const vars = {
      send_ascii: types.boolean.parse('true'),
      url: 'http://foo.bar',
      parameter: {
        fname: 'Mêl',
        lname: 'Gibson'
      }
    };

    assert.equal(integration.request(vars).url, 'http://foo.bar?fname=Mel&lname=Gibson');
  });

  it('should accept and encode basic username and password', function() {
    const vars = {
      basic_username: 'test',
      basic_password: 1234,
    };
    assert.equal(integration.request(vars).headers.Authorization, 'Basic dGVzdDoxMjM0');
  });


  it('should send data as original UTF-8 when told to', function() {
    const vars = {
      send_ascii: types.boolean.parse('false'),
      url: 'http://foo.bar',
      parameter: {
        fname: 'Mêl',
        lname: 'Gibson'
      }
    };

    assert.equal(integration.request(vars).url, 'http://foo.bar?fname=M%C3%AAl&lname=Gibson');
  });

  it('should set redirect-follow option', function() {
    const vars = {
      url: 'http://foo.bar'
    };
    // these boolean assertions are the opposite of those for JSON, form, etc.,
    // because the default for a GET should be true, to follow redirects
    assert.equal(integration.request(vars).followAllRedirects, true);

    vars.follow_redirects = false;
    assert.equal(integration.request(vars).followAllRedirects, false);
  });

  it('should support simple dot-notation', function() {
    const vars = {
      parameter: {
        'foo.bar.baz': 'bip'
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip');
  });


  it('should support dot-notation arrays', function() {
    const vars = {
      parameter: {
        'foo.bar.baz.0': 'bip',
        'foo.bar.baz.1': 'bap'
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip&foo.bar.baz=bap');
  });


  it('should compact array', function() {
    const vars = {
      parameter: {
        'foo.0': 'bip',
        'foo.2': 'bap'
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'foo=bip&foo=bap');
  });


  it('should support dot-notation array reference', function() {
    const vars = {
      parameter: {
        'foo.bar.baz': ['bip', 'bap']
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'foo.bar.baz=bip&foo.bar.baz=bap');
  });


  it('should normalize rich types', function() {
    const vars = {
      parameter: {
        postal_code: types.postal_code.parse('78704'),
        phone: types.phone.parse('512-789-1111 x123'),
        boolean: types.boolean.parse('T'),
        gender: types.gender.parse('F'),
        number: types.number.parse('$100,000.00'),
        range: types.range.parse('1,000-2,000')
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'postal_code=78704&phone=5127891111x123&boolean=true&gender=female&number=100000&range=1000-2000');
  });


  it('should normalize rich type array', function() {
    const vars = {
      parameter: {
        phones: [
          types.phone.parse('512-789-1111 x123'),
          types.phone.parse('512-789-2222 x456')
        ]
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'phones=5127891111x123&phones=5127892222x456');
  });


  it('should use raw value for invalid rich types', function() {
    const vars = {
      parameter: {
        number: types.number.parse('foo')
      }
    };

    assert.equal(integration.request(vars).url.split('?')[1], 'number=foo');
  });
});



describe('Outbound GET Query validation', function() {
  const url = 'http://foo.com';

  it('should require valid URL', () => assert.equal(integration.validate({}), 'URL is required'));


  it('should require valid search outcome', () => assert.equal(integration.validate({url, outcome_on_match: 'donkey'}), "Outcome on match must be 'success', 'failure', or 'error'"));

  it('should allow setting error outcome', () => assert.isUndefined(integration.validate({url, outcome_on_match: 'error'})));


  it('should pass validation', () => assert.isUndefined(integration.validate({url})));


  it('should not allow content-type header', () => assert.equal(integration.validate({url, header: { 'Content-Type': 'foo' }}), 'Invalid Content-Type header value'));


  it('should not allow content-length header', () => assert.equal(integration.validate({url, header: { 'Content-Length': '10' }}), 'Content-Length header is not allowed'));


  it('should not allow accept header', () => assert.equal(integration.validate({url, header: { 'Accept': 'text/whatever' }}), 'Accept header is not allowed'));
});
