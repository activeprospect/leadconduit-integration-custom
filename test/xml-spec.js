const { assert } = require('chai');
const integration = require('../lib/xml');
const types = require('leadconduit-types');


describe('Outbound XML request', function() {

  it('should have url, method, headers, and body', function() {
    const vars = {
      url: 'http://foo.bar',
      xml_path: {
        'lead.fname': 'Mel',
        'lead.lname': 'Gibson'
      },
      header: {
        Whatever: 'foo',
        Bar: 'baz'
      }
    };

    assert.equal(integration.request(vars).url, 'http://foo.bar');
    assert.equal(integration.request(vars).method, 'POST');
    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<lead>
  <fname>Mel</fname>
  <lname>Gibson</lname>
</lead>\
`
    );
    assert.deepEqual(integration.request(vars).headers, {
      'Content-Type': 'text/xml',
      'Content-Length': 81,
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5',
      'Whatever': 'foo',
      'Bar': 'baz'
    }
    );
  });

  it('should send data as ASCII when told to', function() {
    const vars = {
      send_ascii: types.boolean.parse('true'),
      xml_path: {
        'lead.fname': 'Mêl',
        'lead.lname': 'Gibson'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<lead>
  <fname>Mel</fname>
  <lname>Gibson</lname>
</lead>\
`
    );
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
      xml_path: {
        'lead.fname': 'Mêl',
        'lead.lname': 'Gibson'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<lead>
  <fname>Mêl</fname>
  <lname>Gibson</lname>
</lead>\
`
    );
  });

  it('should allow Content-Type override', function() {
    const vars = {
      url: 'http://foo.bar',
      header: {
        'Content-Type': 'application/xml'
      }
    };

    assert.deepEqual(integration.request(vars).headers, {
      'Content-Type': 'application/xml',
      'Content-Length': 21,
      'Accept': 'application/json;q=0.9,text/xml;q=0.8,application/xml;q=0.7,text/html;q=0.6,text/plain;q=0.5'
    }
    );
  });

  it('should set redirect-follow option', function() {
    const vars = {
      url: 'http://foo.bar'
    };
    assert.equal(integration.request(vars).followAllRedirects, false);

    vars.follow_redirects = true;
    assert.equal(integration.request(vars).followAllRedirects, true);
  });

  it('should handle empty xml path', function() {
    const vars = {xml_path: {}};
    assert.equal(integration.request(vars).body, '<?xml version="1.0"?>');
  });


  it('should handle undefined xml path', function() {
    const vars = {};
    assert.equal(integration.request(vars).body, '<?xml version="1.0"?>');
  });


  it('should handle null xml path', function() {
    const vars = {xml_path: undefined};
    assert.equal(integration.request(vars).body, '<?xml version="1.0"?>');
  });


  it('should support simple dot-notation', function() {
    const vars = {
      xml_path: {
        'foo.bar.baz': 'bip'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar>
    <baz>bip</baz>
  </bar>
</foo>\
`
    );
  });

  it('should support dot-notation arrays', function() {
    const vars = {
      xml_path: {
        'foo.bar.baz.0': 'bip',
        'foo.bar.baz.1': 'bap'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar>
    <baz>bip</baz>
    <baz>bap</baz>
  </bar>
</foo>\
`
    );
  });


  it('should compact array', function() {
    const vars = {
      xml_path: {
        'foo.bar.0': 'bip',
        'foo.bar.2': 'bap'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar>bip</bar>
  <bar>bap</bar>
</foo>\
`
    );
  });


  it('should support dot-notation array reference', function() {
    const vars = {
      xml_path: {
        'foo.bar.baz': ['bip', 'bap']
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar>
    <baz>bip</baz>
    <baz>bap</baz>
  </bar>
</foo>\
`
    );
  });


  it('should normalize rich types', function() {
    const vars = {
      xml_path: {
        'lead.postal_code': types.postal_code.parse('78704'),
        'lead.phone': types.phone.parse('512-789-1111 x123'),
        'lead.boolean': types.boolean.parse('T'),
        'lead.gender': types.gender.parse('F'),
        'lead.number': types.number.parse('$100,000.00'),
        'lead.range': types.range.parse('1,000-2,000')
      }
    };

    assert.equal(integration.request(vars).body, //'{"postal_code":"78704","phone":"5127891111x123","boolean":true,"gender":"female","number":100000,"range":"1000-2000"}'
      `\
<?xml version="1.0"?>
<lead>
  <postal_code>78704</postal_code>
  <phone>5127891111x123</phone>
  <boolean>true</boolean>
  <gender>female</gender>
  <number>100000</number>
  <range>1000-2000</range>
</lead>\
`
    );
  });


  it('should normalize rich type array', function() {
    const vars = {
      xml_path: {
        'lead.phone': [
          types.phone.parse('512-789-1111 x123'),
          types.phone.parse('512-789-2222 x456')
        ]
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<lead>
  <phone>5127891111x123</phone>
  <phone>5127892222x456</phone>
</lead>\
`
    );
  });


  it('should use raw value for invalid rich types', function() {
    const vars = {
      xml_path: {
        number: types.number.parse('foo')
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<number>foo</number>\
`
    );
  });

  it('should set attribute', function() {
    const vars = {
      xml_path: {
        'foo.bar@id': '123',
        'foo.bar': 'baz'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar id="123">baz</bar>
</foo>\
`
    );
  });

  it('should set attributes on arrays', function() {
    const vars = {
      xml_path: {
        'foo.bar.0.@id': '123',
        'foo.bar.0.#text': 'baz'
      }
    };

    assert.equal(integration.request(vars).body,
      `\
<?xml version="1.0"?>
<foo>
  <bar id="123">baz</bar>
</foo>\
`
    );
  });

  it('should stuff XML into url encoded body parameter', function() {
    const vars = {
      xml_path: {
        'lead.foo': 'bar',
        'lead.baz': 'bip'
      },
      xml_parameter: 'xmlData'
    };

    const req = integration.request(vars);
    assert.equal(req.headers['Content-Type'], 'application/x-www-form-urlencoded');
    assert.equal(req.body, 'xmlData=%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Clead%3E%0A%20%20%3Cfoo%3Ebar%3C%2Ffoo%3E%0A%20%20%3Cbaz%3Ebip%3C%2Fbaz%3E%0A%3C%2Flead%3E');
  });

  it('should include additional url encoded body parameters if present', function() {
    const vars = {
      xml_path: {
        'lead.foo': 'bar',
        'lead.baz': 'bip'
      },
      xml_parameter: 'xmlData',
      extra_parameter: {
        'authtoken': 'asdf1234asdf1234',
        'scope': 'crmapi'
      }
    };
    const req = integration.request(vars);
    assert.equal(req.headers['Content-Type'], 'application/x-www-form-urlencoded');
    assert.equal(req.body, 'xmlData=%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Clead%3E%0A%20%20%3Cfoo%3Ebar%3C%2Ffoo%3E%0A%20%20%3Cbaz%3Ebip%3C%2Fbaz%3E%0A%3C%2Flead%3E&authtoken=asdf1234asdf1234&scope=crmapi');
  });
});

describe('XML validation', function() {
  const url = 'http://foo.com';

  it('should require valid URL', () => assert.equal(integration.validate({}), 'URL is required'));

  it('should require valid method', () => assert.equal(integration.validate({url, method: 'HEAD'}), 'Unsupported HTTP method - use POST, PUT'));

  it('should require valid search outcome', () => assert.equal(integration.validate({url, outcome_on_match: 'donkey'}), "Outcome on match must be 'success', 'failure', or 'error'"));

  it('should require valid search outcome', () => assert.isUndefined(integration.validate({url, outcome_on_match: 'error'})));

  it('should pass validation', () => assert.isUndefined(integration.validate({url})));

  it('should allow valid content-type header', () => assert.isUndefined(integration.validate({url, header: { 'Content-Type': 'application/xml' }})));

  it('should not allow invalid content-type header', () => assert.equal(integration.validate({url, header: { 'Content-Type': 'text/plain' }}), 'Invalid Content-Type header value'));

  it('should not allow content-length header', () => assert.equal(integration.validate({url, header: { 'Content-Length': '10' }}), 'Content-Length header is not allowed'));

  it('should not allow accept header', () => assert.equal(integration.validate({url, header: { 'Accept': 'text/whatever' }}), 'Accept header is not allowed'));
});
