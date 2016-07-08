# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.8.1] - 2016-07-09
### Fixed
- make `unidecode` a regular dependency (not devDependency)

## [2.8.0] - 2016-07-08
### Added
- support for request variable `send_ascii`: map "true" to this and all lead data will be transliterated to ASCII (e.g., ö -> o)

## [2.7.2] - 2016-06-09
### Fixed
- responses are now always treated as success if no outcome on match and no search term are specified

### Added
- addition of `json_parameter` and `extra_parameter` to JSON integration: "To 'stuff' the JSON into a parameter and send as Form URL encoded" (similar to XML integration's `xml_parameter`)

## [2.7.0] - 2016-05-24
### Added
- new request variable on `xml`: map additional parameters to `extra_parameter.*` when `xml_parameter` is set
- this changelog

## [0.1.0] - 2016-02-10
### Added
- Initial commit
