# LeadConduit Generic Integration

This module is for use on the [LeadConduit](http://activeprospect.com/products/leadconduit/) platform. Please see the [license agreement](http://creativecommons.org/licenses/by-nc-nd/4.0/)


[![Build Status](https://travis-ci.org/activeprospect/leadconduit-integration-generic.svg?branch=master)](https://travis-ci.org/activeprospect/leadconduit-integration-generic)


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

The Form POST integration performs and HTTP POST with a URL encoded request body. The body of the request
is formed using `form_field.*` mappings. The mapping value is the HTTP parameter name. Parameter names that end in
`.<digit>` (i.e. `.0` or `.1`) will be treated as an array element.

For example, consider the following mappings. 

 * `form_field.email` -> `{{lead.email}}`
 * `form_field.name` -> `{{lead.first_name}} {{lead.last_name}}` 
 * `form_field.phone.0` -> `{{lead.phone_1}}`
 * `form_field.phone.1` -> `{{lead.phone_2}}`
 * `form_field.lead_id` -> `{{lead.id}}`
 * `form_field.timestamp` -> `{{submission.timestamp}}`

The above mappings might generate the request body below:

```
lead_id=12345&email=bob%40hotmail.com&name=Bob%20Jones&phone=5127891111&phone=5127892222&timestamp=2016-02-10T17%3A46%3A58.971Z
``` 


## Parsing responses

All integrations parse the server's response body per the `Content-Type` header in the response. The following formats are 
supported: JSON, XML and HTML. When a response is given in JSON or XML, the entire response document will be appended
to the lead data so that it can be used later the flow. 


### Outcome

By default, all integrations treat the outcome of the integration as `success`. You can alter this behavior using the following mappings:
 
 * `search_term` &mdash; A string or regular expression to match the body of the response. Unless the term is found, the 
    outcome will be `failure`. The default term is `.*`, which matches any response body.
 * `search_outcome` &mdash; Specifies the outcome to set when the search term is found. The default is "success". Setting
    this variable to "failure" will produce an outcome of `failure` when the search term is found.
 * `search_path` &mdash; If you wish to look only at a certain part of the response body when evaluating the `search_term`,
    this variable can be used. The value you put in this variable depends on the type of response you expect the target
    server to return. See the _Search Path_ section below.
       
If the server mis-identifies the content type (the Content-Type header identifies the body as XML, but really it's plain text) 
then the search term will be used on the entire response body as though it were plain text.
    
#### Search path
    
When a response is given in JSON, XML, or HTML, the `search_path` can be used to limit the scope of the request body being 
evaluated against the `search_term`. Generally, it's OK to skip using this variable. You will know that you need it if 
your `search_term` is being found when it shouldn't be due to the fact that it appears somewhere in the response body 
other than where you expect it.

For example, assume the `search_term` is "true". Now consider the below JSON response. Notice that the term "true" appears
twice in the JSON document. You need to focus the search term on the "success" key of the document in order to correctly
parse the outcome:

```json
{ 
  "success": true,
  "comment": "It's true this is a great lead!"
}
```

In this example, it's best to set `search_path` to "success". Another way to accomplish this same goal is by using 
`"success": true` for your search term. Though, using the `search_path` is preferable.

Depending on the response type given by the server, you can use different search paths. 

 * JSON &mdash; Use a dot-delimited path such as `submission.success`
 * XML &mdash; Use an XPath location such as `/submission/success/text()`
 * HTML &mdash; Use a CSS selector such as `div.content h1`

Search paths only work with the structured response formats listed above. If a response body cannot be parsed as one
of those content types, the `search_path` variable is ignored.

    
### Parsing failure reason

When the outcome is `failure`, the reason for the failure can be parsed from the response body. Use the `reason_selector`
variable to set the path to the reason in a JSON, XML, or HTML document.

Depending on the response type given by the server, you can use different reason selectors. 

 * JSON &mdash; Use a dot-delimited path such as `submission.reason`
 * XML &mdash; Use an XPath location such as `/submission/reason/text()`
 * HTML &mdash; Use a CSS selector such as `div.content h2.error`

If you would like to set a default failure reason, you can do so using the `default_reason` variable. This variable is 
ignored if `reason_selector` matches something in the document. 
