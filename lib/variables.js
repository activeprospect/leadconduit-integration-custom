module.exports = [
  { name: 'outcome_search_term', description: 'The text to search for in the response. When found outcome will be "success". Regular expressions are allowed. Pro tip: Use Outcome on Match to use this term to search for "failure" instead of "success".', type: 'string', required: false },
  { name: 'outcome_search_path', description: 'Narrow the search scope using dot-notation path (for JSON responses), XPath (for XML responses), or CSS selector (for HTML responses)', type: 'string', required: false },
  { name: 'outcome_on_match', description: 'The outcome when the search term is found - "success" or "failure" or "error" (default: success)', type: 'string', required: false },
  { name: 'reason_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the failure reason', type: 'string', required: false },
  { name: 'price_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the lead price', type: 'string', required: false },
  { name: 'fallback_price', description: 'The fallback price to use if the price_path fails to parse a price from the response.', type: 'number', required: false },
  { name: 'reference_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the reference ID', type: 'string', required: false },
  { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Path setting', type: 'string', required: false },
  { name: 'header.*', description: 'HTTP header to send in the request', type: 'wildcard', required: false },
  { name: 'send_ascii', description: 'Set to true to ensure lead data is sent as ASCII for legacy recipients (default: false)', type: 'boolean', required: false },
  { name: 'capture.*', description: 'A named regular expression with a single capture group, used to capture values from plain text responses into the named property', type: 'wildcard' },
  { name: 'response_content_type_override', description: "Override response's Content-Type header with custom value.", type: 'string', required: false },
  { name: 'cookie_search_term', description: "The text to search for to identify an HTTP cookie. Usually the cookie 'name' is sufficient; regular expressions are allowed", type: 'string', required: false },
  { name: 'follow_redirects', description: 'If true, follow redirects even on methods other than GET (default: false)', type: 'boolean', required: false }
];
