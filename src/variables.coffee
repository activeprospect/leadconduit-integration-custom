module.exports = [
  { name: 'search_term', description: 'The term to search for - when found, outcome is set per the Search Outcome setting. Regular expressions are allowed.', type: 'string', required: false }
  { name: 'search_outcome', description: 'The outcome when the term is found - "success" or "failure" (default: success)', type: 'string', required: false }
  { name: 'search_path', description: 'Narrow the search scope using dot-notation path (for JSON responses), XPath (for XML responses), or CSS selector (for HTML responses)', type: 'string', required: false }
  { name: 'default_reason', description: 'Failure reason when no reason can be found per the optional Reason Selector setting', type: 'string', required: false }
  { name: 'reason_selector', description: 'The dot-notation path, XPath location, or regular expression with a single capture group, used to select the failure reason', type: 'string', required: false }
]
