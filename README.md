# LeadConduit Custom Integration

This module is for use on the [LeadConduit](http://activeprospect.com/products/leadconduit/) platform. Please see the [license agreement](http://creativecommons.org/licenses/by-nc-nd/4.0/)


![Testing](https://github.com/activeprospect/leadconduit-api/workflows/Testing/badge.svg)


## JSON

The JSON integration performs an HTTP POST, PUT, or DELETE with a request body formatted as JSON. The body of the JSON
to be sent is formed using `json_property.*` mappings. The mapping value is the dot-notation path in the JSON document
where you would like the value to be set.

For example, consider the following mappings. 

 * `json_property.submission.email` -> `{{lead.email}}`
 * `json_property.submission.name` -> `{{lead.first_name}} {{lead.last_name}}` 
 * `json_property.submission.phones.0` -> `{{lead.phone_1}}`
 * `json_property.submission.phones.1` -> `{{lead.phone_2}}`
 * `json_property.lead_id` -> `{{lead.id}}`
 * `json_property.timestamp` -> `{{submission.timestamp}}`

The above mappings might generate the JSON document below:

```json
{ 
  "lead_id": "12345",
  "submission": { 
    "email": "bob@hotmail.com",
    "name": "Bob Jones",
    "phones": [
      "5127891111",
      "5127892222"
    ]
   },
   "timestamp": "2016-02-10T17:46:58.971Z"
}    
    
```

Use the `method` property to set the HTTP method (`POST`, `PUT`, and `DELETE` are supported).


## Form POST

The Form POST integration performs an HTTP POST with a URL encoded request body. The body of the request
is formed using `form_field.*` mappings. The mapping value is the HTTP parameter name. Parameter names that end in
`.<digit>` (i.e. `.0` or `.1`) will be treated as an array element (null values created by that array
addressing are compacted out).

For example, consider the following mappings. 

 * `form_field.email` -> `{{lead.email}}`
 * `form_field.name` -> `{{lead.first_name}} {{lead.last_name}}` 
 * `form_field.phone.0` -> `{{lead.phone_1}}`
 * `form_field.phone.1` -> `{{lead.phone_2}}`
 * `form_field.phone.5` -> '5125551212'
 * `form_field.lead_id` -> `{{lead.id}}`
 * `form_field.timestamp` -> `{{submission.timestamp}}`

The above mappings might generate the request body below:

```
lead_id=12345&email=bob%40hotmail.com&name=Bob%20Jones&phone=5127891111&phone=5127892222&phone=5125551212&timestamp=2016-02-10T17%3A46%3A58.971Z
``` 


## XML

The XML integration performs an HTTP POST or PUT with a request body formatted as XML. The body of the XML
to be sent is formed using `xml_path.*` mappings. The mapping value is the dot-notation path in the XML document
where you would like the value to be set. 

Because XML elements can have attributes, we have implemented an extension to the dot-notation convention. Any
dot-notation path that contains the `@` character will be treated an an attribute value. 

For example, consider the following mappings. 

 * `xml_path.submission.email` -> `{{lead.email}}`
 * `xml_path.submission.name` -> `{{lead.first_name}} {{lead.last_name}}` 
 * `xml_path.submission.phones.phone.0` -> `{{lead.phone_1}}`
 * `xml_path.submission.phones.phone.1` -> `{{lead.phone_2}}`
 * `xml_path.submission.birthday@month` -> `{{format lead.dob format="MM"}}`
 * `xml_path.submission.birthday@day` -> `{{format lead.dob format="DD"}}`
 * `xml_path.submission.birthday@year` -> `{{format lead.dob format="YYYY"}}`
 * `xml_path.submission.foo@bar` -> 'baz'
 * `xml_path.submission.foo` -> `bip`
 * `xml_path.submission.lead_id` -> `{{lead.id}}`
 * `xml_path.submission.timestamp` -> `{{submission.timestamp}}`

The above mappings might generate the XML document below:

```xml
<submission>
  <email>bob@hotmail.com</email>
  <name>Bob Jones</name>
  <phones>
    <phone>5127891111</phone>
    <phone>5127892222</phone>
  </phones>
  <birthday month="10" day="12" year="1976"/>
  <foo bar="baz">bip</foo>
  <lead_id>12345</lead_id>
  <timestamp>2016-02-10T17:46:58.971Z</timestamp>
</submission>
```

Use the `method` property to set the HTTP method (`POST` and`PUT` are supported).

Some XML endpoints require a Content-Type of `application/x-www-form-urlencoded` with the XML document submitted
in a parameter. Use the `parameter` variable to set the name of the parameter to use. When this parameter is omitted
the Content-Type will be `text/xml` and the XML document will be submitted in the body of the request.


## SOAP

The SOAP integration is for use with SOAP web services. The `url` mapping is used to specify the URL to the SOAP
service WSDL document. The `function` and `arg` mappings are used to invoke a web service function over HTTP.
 
For example, consider the following mappings.
 
 * `url` -> `https://some.service.com/ws?WSDL`
 * `function` -> `AddLead`
 * `arg.Lead.FirstName` -> `{{lead.first_name}}`
 * `arg.Lead.LastName` -> `{{lead.last_name}}`
 * `arg.Lead.Email` -> `{{lead.email}}`
 
The above mappings would invoke the `AddLead` function with a single argument named `Lead`:

```
{
  FirstName: 'Bob',
  LastName: 'Jones',
  Email: 'bob%40hotmail.com'
}
```

## Plain Text

For plain text or HTML responses (but _not_ XML or JSON), string values can be extracted by mapping regular expressions
to "capture" variables.

For example, with these mappings:

 * `matched (.*) records` -> `{{capture.number_records}}`

And a response like:

```
Query matched 42 records.
```

This would result in an appended value, `number_records`, with a value of "42".

The formulation of expression can be tricky, especially for long or multi-line responses.
Mapped regular expression values are lowercased, so take that into consideration, or use syntax like `/.../i`.
Line-separators in the response may not match anchors (`^` & `$`) as expected, so use of the "multiline" modifier may be needed (`/.../m`).

Another example, which will result in `title` being set with "The Raven":

Mapping: `/^Title: (.*)$/im` -> `{{capture.title}}`

Response:

```
The Project Gutenberg EBook of The Raven, by Edgar Allan Poe

Title: The Raven

Author: Edgar Allen Poe
```

## Parsing responses

All integrations parse the server's response body per the `Content-Type` header in the response. The following formats are 
supported: JSON, XML and HTML. When a response is given in JSON or XML, the entire response document will be appended
to the lead data so that it can be used later the flow. 


### Outcome

By default, all integrations treat the outcome of the integration as `success`. You can alter this behavior using the following mappings:
 
 * `outcome_search_term` &mdash; A string or regular expression to match the body of the response. Unless the term is found, the 
    outcome will be `failure`. The default term is `.*`, which matches any response body.
 * `outcome_on_match` &mdash; Specifies the outcome to set when the search term is found. The default is "success". Setting
    this variable to "failure" will produce an outcome of `failure` when the search term is found.
 * `outcome_search_path` &mdash; If you wish to look only at a certain part of the response body when evaluating the `outcome_search_term`,
    this variable can be used. The value you put in this variable depends on the type of response you expect the target
    server to return. See the _Search Path_ section below.
       
If the server mis-identifies the content type (the Content-Type header identifies the body as XML, but really it's plain text) 
then the search term will be used on the entire response body as though it were plain text.
    
#### Search path
    
When a response is given in JSON, XML, or HTML, the `outcome_search_path` can be used to limit the scope of the request body being 
evaluated against the `outcome_search_term`. Generally, it's OK to skip using this variable. You will know that you need it if 
your `outcome_search_term` is being found when it shouldn't be due to the fact that it appears somewhere in the response body 
other than where you expect it.

For example, assume the `outcome_search_term` is "true". Now consider the below JSON response. Notice that the term "true" appears
twice in the JSON document. You need to focus the search term on the "success" key of the document in order to correctly
parse the outcome:

```json
{ 
  "success": true,
  "comment": "It's true this is a great lead!"
}
```

In this example, it's best to set `outcome_search_path` to "success". Another way to accomplish this same goal is by using 
`"success": true` for your search term. Though, using the `outcome_search_path` is preferable.

Depending on the response type given by the server, you can use different search paths. 

 * JSON &mdash; Use a dot-delimited path such as `submission.success`
 * XML &mdash; Use an XPath location such as `/submission/success/text()`
 * HTML &mdash; Use a CSS selector such as `div.content h1`

Search paths only work with the structured response formats listed above. If a response body cannot be parsed as one
of those content types, the `outcome_search_path` variable is ignored.

    
### Parsing failure reason

When the outcome is `failure`, the reason for the failure can be parsed from the response body. Use the `reason_path`
variable to set the path to the reason in a JSON, XML, or HTML document.

Depending on the response type given by the server, you can use different `reason_path` values. 

 * JSON &mdash; Use a dot-delimited path such as `submission.reason`
 * XML &mdash; Use an XPath location such as `/submission/reason/text()`
 * HTML &mdash; Use a CSS selector such as `div.content h2.error`. By default the matching elements' text will be extracted
   for the reason. If you are interested instead in an attribute value, specify that using `@attrName` where attrName is the 
   name of the attribute. For example `div.content h2.error @reason`, will find a div element with the "content" class
   that contains an h2 element with the "error" class, and extract the "reason" attribute value.   

If you would like to set a default failure reason, you can do so using the `default_reason` variable. This variable is 
ignored if `reason_path` matches something in the document. 
