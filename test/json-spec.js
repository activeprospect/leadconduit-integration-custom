const { assert } = require('chai');
const integration = require('../lib/json');
const types = require('leadconduit-types');


describe('Outbound JSON request', function() {

  it('should have url, method, headers, and body', function() {
    const vars = {
      url: 'http://foo.bar',
      json_property: {
        fname: 'Mel',
        lname: 'Gibson'
      },
      header: {
        Whatever: 'foo',
        Bar: 'baz'
      }
    };

    assert.equal(integration.request(vars).url, 'http://foo.bar');
    assert.equal(integration.request(vars).method, 'POST');
    assert.equal(integration.request(vars).body, '{"fname":"Mel","lname":"Gibson"}');
    assert.deepEqual(integration.request(vars).headers, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': 32,
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5',
      'Whatever': 'foo',
      'Bar': 'baz'
    }
    );
  });


  it('should send data as ASCII when told to', function() {
    const vars = {
      send_ascii: types.boolean.parse('true'),
      json_property: {
        fname: 'Mêl',
        lname: 'Gibson'
      }
    };

    assert.equal(integration.request(vars).body, '{"fname":"Mel","lname":"Gibson"}');
  });


  it('should send data as original UTF-8 when told to', function() {
    const vars = {
      send_ascii: types.boolean.parse('false'),
      json_property: {
        fname: 'Mêl',
        lname: 'Gibson'
      }
    };

    assert.equal(integration.request(vars).body, '{"fname":"Mêl","lname":"Gibson"}');
  });


  it('should allow Content-Type override', function() {
    const vars = {
      url: 'http://foo.bar',
      header: {
        'Content-Type': 'application/json'
      }
    };

    assert.deepEqual(integration.request(vars).headers, {
      'Content-Type': 'application/json',
      'Content-Length': 2,
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
    }
    );
  });


  it('should support simple dot-notation', function() {
    const vars = {
      json_property: {
        'foo.bar.baz': 'bip'
      }
    };

    assert.equal(integration.request(vars).body, '{"foo":{"bar":{"baz":"bip"}}}');
  });


  it('should support dot-notation arrays', function() {
    const vars = {
      json_property: {
        'foo.bar.baz.0': 'bip',
        'foo.bar.baz.1': 'bap'
      }
    };

    assert.equal(integration.request(vars).body, '{"foo":{"bar":{"baz":["bip","bap"]}}}');
  });


  it('should support dot-notation array reference', function() {
    const vars = {
      json_property: {
        'foo.bar.baz': ['bip', 'bap']
      }
    };

    assert.equal(integration.request(vars).body, '{"foo":{"bar":{"baz":["bip","bap"]}}}');
  });


  it('should normalize rich types', function() {
    const vars = {
      json_property: {
        postal_code: types.postal_code.parse('78704'),
        phone: types.phone.parse('512-789-1111 x123'),
        boolean: types.boolean.parse('T'),
        gender: types.gender.parse('F'),
        number: types.number.parse('$100,000.00'),
        range: types.range.parse('1,000-2,000')
      }
    };

    assert.equal(integration.request(vars).body, '{"postal_code":"78704","phone":"5127891111x123","boolean":true,"gender":"female","number":100000,"range":"1000-2000"}');
  });


  it('should normalize rich type array', function() {
    const vars = {
      json_property: {
        phones: [
          types.phone.parse('512-789-1111 x123'),
          types.phone.parse('512-789-2222 x456')
        ]
      }
    };

    assert.equal(integration.request(vars).body, '{"phones":["5127891111x123","5127892222x456"]}');
  });


  it('should use raw value for invalid rich types', function() {
    const vars = {
      json_property: {
        number: types.number.parse('foo')
      }
    };

    assert.equal(integration.request(vars).body, '{"number":"foo"}');
  });

  it('should stuff JSON into url-encoded body parameter and include any additional parameters', function() {
    const vars = {
      json_property: {
        postal_code: types.postal_code.parse('78704'),
        phone: types.phone.parse('512-789-1111 x123'),
        boolean: types.boolean.parse('T'),
        gender: types.gender.parse('F'),
        number: types.number.parse('$100,000.00'),
        range: types.range.parse('1,000-2,000')
      },
      json_parameter: 'element',
      nested_extra_parameter: {
        preference: {
          terms: {
            isGranted: true
          },
        },
        preference_two: {
          terms: {
            isGranted: false
          },
        },
      },
      extra_parameter: {
        'sessionName': 'asdf1234asdf1234',
        'operation': 'create',
        'elementType': 'lead'
      }
    };

    assert.equal(integration.request(vars).headers['Content-Type'], 'application/x-www-form-urlencoded');
    assert.equal(integration.request(vars).body, 'element=%7B%22postal_code%22%3A%2278704%22%2C%22phone%22%3A%225127891111x123%22%2C%22boolean%22%3Atrue%2C%22gender%22%3A%22female%22%2C%22number%22%3A100000%2C%22range%22%3A%221000-2000%22%7D&preference=%7B%22terms%22%3A%7B%22isGranted%22%3Atrue%7D%7D&preference_two=%7B%22terms%22%3A%7B%22isGranted%22%3Afalse%7D%7D&sessionName=asdf1234asdf1234&operation=create&elementType=lead');
  });

  it('should include extra parameters but not json parameter if json property is absent', function() {
    const vars = {
      json_parameter: 'element',
      nested_extra_parameter: {
        preference: {
          terms: {
            isGranted: true
          },
        },
        preference_two: {
          terms: {
            isGranted: false
          },
        },
      },
      extra_parameter: {
        'sessionName': 'asdf1234asdf1234',
        'operation': 'create',
        'elementType': 'lead'
      }
    };

    assert.equal(integration.request(vars).headers['Content-Type'], 'application/x-www-form-urlencoded');
    assert.equal(integration.request(vars).body, 'preference=%7B%22terms%22%3A%7B%22isGranted%22%3Atrue%7D%7D&preference_two=%7B%22terms%22%3A%7B%22isGranted%22%3Afalse%7D%7D&sessionName=asdf1234asdf1234&operation=create&elementType=lead');
  });

  it('should compact array', function() {
    const vars = {
      json_property: {
        'foo.0': 'baz',
        'foo.1': null,
        'foo.2': 'bip'
      }
    };
    assert.equal(integration.request(vars).body, '{"foo":["baz","bip"]}');
  });


  it('should build array', function() {
    const vars = {
      json_property: {
        '0.foo.bar': 'baz',
        '1.foo.bip': 'bap',
        '1.foo.bar': 'bip'
      }
    };
    assert.equal(integration.request(vars).body, '[{"foo":{"bar":"baz"}},{"foo":{"bip":"bap","bar":"bip"}}]');
  });


  it('should support brackets in key names', function() {
    const vars = {
      json_property: {
        'foo.bar[what_is_your_interest]': 'astrophysics'
      }
    };

    assert.equal(integration.request(vars).body, '{"foo":{"bar[what_is_your_interest]":"astrophysics"}}');
  });


  it('should compact array with missing index', function() {
    const vars = {
      json_property: {
        '0.foo.bar': 'baz',
        '2.foo.bip': 'bap',
        '2.foo.bar': 'bip'
      }
    };
    assert.equal(integration.request(vars).body, '[{"foo":{"bar":"baz"}},{"foo":{"bip":"bap","bar":"bip"}}]');
  });


  it('should build object even though a json property has a leading digit', function() {
    const vars = {
      json_property: {
        '0.foo.bar': 'baz',
        'bip': 'bap'
      }
    };
    assert.equal(integration.request(vars).body, '{"0":{"foo":{"bar":"baz"}},"bip":"bap"}');
  });

  it('should accept and encode basic username and password', function() {
    const vars = {
      basic_username: 'test',
      basic_password: 1234,
    };
    assert.equal(integration.request(vars).headers.Authorization, 'Basic dGVzdDoxMjM0');
  });
});



describe('JSON validation', function() {
  const url = 'http://foo.com'

  it('should require valid URL', () => assert.equal(integration.validate({}), 'URL is required'));

  it('should require not require method', () => assert.isUndefined(integration.validate({url})));

  it('should require valid method', () => assert.equal(integration.validate({url, method: 'HEAD'}), 'Unsupported HTTP method - use POST, PUT, DELETE'));

  it('should require valid search outcome', () => assert.equal(integration.validate({url, outcome_on_match: 'donkey'}), "Outcome on match must be 'success', 'failure', or 'error'"));

  it('should allow setting error outcome', () => assert.isUndefined(integration.validate({url, outcome_on_match: 'error'})));

  it('should pass validation', () => assert.isUndefined(integration.validate({url})));

  it('should allow valid content-type header', () => assert.isUndefined(integration.validate({url, header: { 'Content-Type': 'application/json' }})));

  it('should not allow invalid content-type header', () => assert.equal(integration.validate({url, header: { 'Content-Type': 'text/xml' }}), 'Invalid Content-Type header value'));

  it('should not allow content-length header', () => assert.equal(integration.validate({url, header: { 'Content-Length': '10' }}), 'Content-Length header is not allowed'));

  it('should not allow accept header', () => assert.equal(integration.validate({url, header: { 'Accept': 'text/whatever' }}), 'Accept header is not allowed'));
});
