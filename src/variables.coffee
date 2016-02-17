module.exports = [
  { name: 'outcome_search_term', description: 'The text to search for in the response. When found outcome will be "success". Regular expressions are allowed. Pro tip: Use Outcome on Match to use this term to search for "failure" instead of "success".', type: 'string', required: false }
  { name: 'outcome_search_path', description: 'Narrow the search scope using dot-notation path (for JSON responses), XPath (for XML responses), or CSS selector (for HTML responses)', type: 'string', required: false }
  { name: 'outcome_on_match', description: 'The outcome when the search term is found - "success" or "failure" (default: success)', type: 'string', required: false }
  { name: 'reason_path', description: 'The dot-notation path (for JSON responses), XPath location (for XML responses), or regular expression with a single capture group, used to find the failure reason', type: 'string', required: false }
  { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Path setting', type: 'string', required: false }
  { name: 'header.*', description: 'HTTP header to send in the request', type: 'wildcard', required: false }
]
