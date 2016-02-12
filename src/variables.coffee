module.exports = [
  { name: 'outcome_search_term', description: 'The term to search for - when found, outcome is set per the Outcome on Match setting. Regular expressions are allowed.', type: 'string', required: false }
  { name: 'outcome_search_path', description: 'Narrow the search scope using dot-notation path (for JSON responses), XPath (for XML responses), or CSS selector (for HTML responses)', type: 'string', required: false }
  { name: 'outcome_on_match', description: 'The outcome when the term is found - "success" or "failure" (default: success)', type: 'string', required: true }
  { name: 'reason_path', description: 'The dot-notation path, XPath location, or regular expression with a single capture group, used to find the failure reason', type: 'string', required: false }
  { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Path setting', type: 'string', required: false }
  { name: 'header.*', description: 'HTTP header to send in the request', type: 'wildcard', required: false }
]
