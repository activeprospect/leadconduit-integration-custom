const { assert } = require('chai');
const soap = require('../lib/soap');
const nock = require('nock');
const types = require('leadconduit-types');
const fs = require('fs');
const wsdl = fs.readFileSync(`${__dirname}/soap-wsdl.xml`);
const success = fs.readFileSync(`${__dirname}/soap-success.xml`);
const failure = fs.readFileSync(`${__dirname}/soap-failure.xml`);
const encoded = fs.readFileSync(`${__dirname}/soap-encoded.xml`);


describe('Outbound SOAP', function() {
  beforeEach(function() {
    this.wsdl = nock('http://donkey')
      .get('/login/ws/ws.asmx?WSDL')
      .reply(200, wsdl, {'Content-Type': 'text/xml'});
  });

  afterEach(function() {
    if (this.service != null) {
      this.service.done();
    }
    nock.cleanAll();
  });


  it('should error on unsupported function', function(done) {
    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'someUnsupportedFunction'
    };

    soap.handle(vars, function(err) {
      assert.equal(err.message, 'Unsupported SOAP function specified');
      done();
    });
  });


  it('should use basic auth credentials', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx')
      .basicAuth({
          user: 'bob',
          pass: 'sekret'}).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      basic_username: 'bob',
      basic_password: 'sekret'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should use ws credentials', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<wsse:Username>bob</wsse:Username>') > 0) &&
      (body.indexOf('<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">sekret</wsse:Password>') > 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      wss_username: 'bob',
      wss_password: 'sekret'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should digest ws password', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<wsse:Username>bob</wsse:Username>') > 0) &&
      (body.indexOf('<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">') > 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      wss_username: 'bob',
      wss_password: 'sekret',
      wss_digest_password: true
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should use bearer token', function(done) {
    this.service = nock('http://donkey', {
      reqheaders: {
        Authorization(value) {
          return value === 'Bearer crunchy';
        }
      }
    }).post('/login/ws/ws.asmx')
    .reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      bearer_token: 'crunchy'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should pass arguments', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<FirstName>Bob</FirstName>') >= 0) &&
    (body.indexOf('<ZipCode>78704-1234</ZipCode>') >= 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLead',
      'arg.Lead.FirstName': 'Bob',
      'arg.Lead.ZipCode': types.postal_code.parse('78704-1234')
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should pass arguments and set attribute', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<Lead SomethingSomethingId="42">') >= 0) &&
    (body.indexOf('<FirstName>Bob</FirstName>') >= 0) &&
    (body.indexOf('<ZipCode>78704-1234</ZipCode>') >= 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLead',
      'arg.Lead.attributes.SomethingSomethingId': '42',  //
      'arg.Lead.FirstName': 'Bob',
      'arg.Lead.ZipCode': types.postal_code.parse('78704-1234')
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should compact array arguments', function(done) {
    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLead',
      'arg.Lead.bar.0': 'bip',
      'arg.Lead.bar.1': null,
      'arg.Lead.bar.2': 'bap'
    };

    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<bar>bip</bar>') >= 0) &&
    (body.indexOf('<bar>bap</bar>') >= 0) &&
    (__guard__(body.match(/\<bar\>/g), x => x.length) === 2)).reply(200, success, {'Content-Type': 'text/xml'});

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should send data as ASCII when told to', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<FirstName>Bob</FirstName>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLead',
      'send_ascii': types.boolean.parse('true'),
      'arg.Lead.FirstName': 'Böb'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should send data as original UTF-8 when told to', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<FirstName>Böb</FirstName>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLead',
      'send_ascii': types.boolean.parse('false'),
      'arg.Lead.FirstName': 'Böb'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should encode XML into first string argument', function(done) {
    this.service = nock('http://donkey')
    .post('/login/ws/ws.asmx', body => (body.indexOf('&lt;FirstName&gt;Bob&lt;/FirstName&gt;') >= 0) &&
      (body.indexOf('&lt;ZipCode&gt;78704-1234&lt;/ZipCode&gt;') >= 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLeadXML',
      'arg.LeadXML.Lead.FirstName': 'Bob',
      'arg.LeadXML.Lead.ZipCode': types.postal_code.parse('78704-1234')
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });

  it('should not encode text in a CDATA section', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<![CDATA[Hello World! & <Hello Me!>]]>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      'url': 'http://donkey/login/ws/ws.asmx?WSDL',
      'function': 'AddLeadXML',
      'arg.LeadXML': '<![CDATA[Hello World! & <Hello Me!>]]>'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });

  it('should timeout', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx')
      .socketDelay(10000)
      .reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      timeout_seconds: 5
    };

    soap.handle(vars, function(err, event) {
      assert.equal(err.message, 'ESOCKETTIMEDOUT');
      assert.isUndefined(event);
      done();
    });
  });


  it('should not timeout', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx')
      .socketDelay(10000)
      .reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      timeout_seconds: 12
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });

  it('should default to SOAP 1.1', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should use SOAP 1.2', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      version: '1.2'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should use SOAP 1.1', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      version: '1.1'
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should set headers', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<SessionHeader xmlns="urn:foo.bar"><sessionId>88774421</sessionId></SessionHeader>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      soap_header: {
        'SessionHeader.sessionId': 88774421,
        'SessionHeader@xmlns': 'urn:foo.bar'
      }
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should set multiple headers', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => (body.indexOf('<SessionHeader xmlns="urn:foo.bar"><sessionId>88774421</sessionId></SessionHeader>') >= 0) &&
    (body.indexOf('<OtherHeader xmlns="urn:foo.other"><Id>4321</Id></OtherHeader>') >= 0)).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      soap_header: {
        'SessionHeader.sessionId': 88774421,
        'SessionHeader@xmlns': 'urn:foo.bar',
        'OtherHeader.Id': 4321,
        'OtherHeader@xmlns': 'urn:foo.other'
      }
    };

    soap.handle(vars, function(err, event) {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should have a request body with the root element namespace prefix and xlmns attributes when specified', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<cal:AddLead xmlns:cal="http://donkey/ws.asmx/"></cal:AddLead>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      root_namespace_prefix: 'cal',
      root_xmlns_attribute_name: 'xmlns:cal',
      root_xmlns_attribute_value: 'http://donkey/ws.asmx/'
    };

    soap.handle(vars, (err, event) => {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  it('should not fail when the root element namespace prefix is defined but the xlmns attributes name/value pair are not specified', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<cal:AddLead xmlns="http://donkey/ws.asmx/"></cal:AddLead>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      root_namespace_prefix: 'cal'
    };

    soap.handle(vars, (err, event) => {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });

  it('should not fail when the root element namespace prefix is not defined but the root element xlmns attributes name/value pairs are specified', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<AddLead xmlns:cal="http://donkey/ws.asmx/"></AddLead>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead',
      root_xmlns_attribute_name: 'xmlns:cal',
      root_xmlns_attribute_value: 'http://donkey/ws.asmx/'
    };

    soap.handle(vars, (err, event) => {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });

  it('should not fail when the root element namespace prefix and xlmns attributes name/value pairs are not specified', function(done) {
    this.service = nock('http://donkey')
      .post('/login/ws/ws.asmx', body => body.indexOf('<AddLead xmlns="http://donkey/ws.asmx/"></AddLead>') >= 0).reply(200, success, {'Content-Type': 'text/xml'});

    const vars = {
      url: 'http://donkey/login/ws/ws.asmx?WSDL',
      function: 'AddLead'
    };

    soap.handle(vars, (err, event) => {
      if (err) { done(err); }
      assert.equal(event.outcome, 'success');
      done();
    });
  });


  describe('response', function() {

    beforeEach(function() {
      this.service = nock('http://donkey')
        .post('/login/ws/ws.asmx')
        .reply(200, success, {'Content-Type': 'text/xml'});
      this.vars = {
        url: 'http://donkey/login/ws/ws.asmx?WSDL',
        function: 'AddLead'
      };
    });


    it('should append data', function(done) {
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.deepEqual(event.AddLeadResult, {
          Result: true,
          Message: 'some message',
          LeadId: 12345,
          Empty: null,
          Cost: "1.5",
          Multi: {
            Foo: [ '1', '2' ]
          }
        });
        done();
      });
    });

    it('should default to success without search term', function(done) {
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });



    it('should default to failure per outcome on match', function(done) {
      this.vars.outcome_on_match = 'failure';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });



    it('should find search term with exact match', function(done) {
      this.vars.outcome_search_term = 'some message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });



    it('should find search term with exact match at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'some message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should not find search term', function(done) {
      this.vars.outcome_search_term = 'bar';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should not find search term at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'foo';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });

    it('should not bonk with bogus search path', function(done) {
      this.vars.outcome_search_path = '0';
      this.vars.outcome_search_term = 'foo';

      const invokeHandle = () => {
        soap.handle(this.vars, (err, event) => {}); 
      };

      assert.doesNotThrow(invokeHandle);
      done();
    });

    it('should not find search term at different path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Result';
      this.vars.outcome_search_term = 'some message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should failure on match per outcome on match', function(done) {
      this.vars.outcome_search_term = 'some message';
      this.vars.outcome_on_match = 'failure';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should failure on match per outcome on match at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'some message';
      this.vars.outcome_on_match = 'failure';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should find search term with partial match', function(done) {
      this.vars.outcome_search_term = 'some';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find search term with partial match at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'some';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find search term with regex', function(done) {
      this.vars.outcome_search_term = '[a-z]{4}\\s[a-z]{7}';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find search term with regex at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = '[a-z]{4}\\s[a-z]{7}';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find search term with regex including slashes', function(done) {
      this.vars.outcome_search_term = '/[a-z]{4}\\s[a-z]{7}/';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find search term with regex with slashes at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = '/[a-z]{4}\\s[a-z]{7}/';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should not error on invalid regex search term', function(done) {
      this.vars.outcome_search_term = '/[/';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should not error on invalid regex search term at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = '/[/';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should find upper case search term', function(done) {
      this.vars.outcome_search_term = 'SOME MESSAGE';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find lower case search term', function(done) {
      this.vars.outcome_search_term = 'some message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find upper case search term at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'SOME MESSAGE';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should find lower case search term at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'some message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        done();
      });
    });


    it('should not find match', function(done) {
      this.vars.outcome_search_term = 'whatever';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should not find match at path', function(done) {
      this.vars.outcome_search_path = 'AddLeadResult.Message';
      this.vars.outcome_search_term = 'whatever';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        done();
      });
    });


    it('should parse reason', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.reason_path = 'AddLeadResult.Message';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.equal(event.reason, 'some message');
        done();
      });
    });


    it('should discard empty reason', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.reason_path = 'AddLeadResult.Empty';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.isUndefined(event.reason);
        done();
      });
    });


    it('should parse multiple reasons', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.reason_path = 'AddLeadResult.Multi.Foo';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.equal(event.reason, '1, 2');
        done();
      });
    });


    it('should default reason', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.default_reason = 'just because';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.equal(event.reason, 'just because');
        done();
      });
    });


    it('should fail to parse reason', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.reason_path = 'AddLeadResult.Bogus';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.isUndefined(event.reason);
        done();
      });
    });


    it('should use default reason on failure to parse reason', function(done) {
      this.vars.outcome_search_term = 'false';
      this.vars.default_reason = 'just because';
      this.vars.reason_path = 'AddLeadResult.Bogus';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'failure');
        assert.equal(event.reason, 'just because');
        done();
      });
    });


    it('should parse encoded XML encoded in string result', function(done) {
      nock.cleanAll();

      this.wsdl = nock('http://donkey')
        .get('/login/ws/ws.asmx?WSDL')
        .reply(200, wsdl, {'Content-Type': 'text/xml'});

      this.service = nock('http://donkey')
        .post('/login/ws/ws.asmx')
        .reply(200, encoded, {'Content-Type': 'text/xml'});

      this.vars = {
        url: 'http://donkey/login/ws/ws.asmx?WSDL',
        function: 'AddLead'
      };

      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        // Normally, SOAP would take care of making sure all the response data is typed correctly.
        // But since this tests for the case where the service encodes response XML into a single string
        // return value, there's no way for SOAP to do the type conversion, and we wind up with all strings.
        // Compare this behavior to the 'should append data' spec to see the difference.
        assert.deepEqual(event.AddLeadXMLResult, {
          Response: {
            Result: 'true',
            Message: 'some message',
            LeadId: '12345',
            Empty: '',
            Multi: {
              Foo: [ '1', '2' ]
            }
          }
        });
        done();
      });
    });

    it('should capture price', function(done) {
      this.vars.price_path = 'AddLeadResult.Cost';
      soap.handle(this.vars, (err, event) => {
        if (err) { done(err); }
        assert.equal(event.outcome, 'success');
        assert.equal(event.price, 1.5);
        done();
      });
    });
  });


  describe('validation', function() {

    it('should require valid URL', function() {
      assert.equal(soap.validate({}), 'URL is required');
      assert.equal(soap.validate({url: 'donkey'}), 'URL must be valid');
    });


    it('should require function', function() {
      assert.equal(soap.validate({url: 'http://foo'}), 'Function is required');
      assert.equal(soap.validate({url: 'http://foo', function: 'donkey/kong'}), 'Function must have valid name');
    });


    it('should require valid search outcome', () => assert.equal(soap.validate({url: 'http://foo', outcome_on_match: 'donkey'}), "Outcome on match must be 'success' or 'failure'"));


    it('should pass validation', () => assert.isUndefined(soap.validate({url: 'http://foo', function: 'whatever'})));


    it('should require valid SOAP version', () => assert.equal(soap.validate({url: 'http://foo', function: 'whatever', version: '0'}), 'Must be valid SOAP version: 1.1 or 1.2'));
  });
});




function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}