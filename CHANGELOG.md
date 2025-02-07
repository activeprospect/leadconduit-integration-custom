# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.23.6] - 2025-01-28
### Fixed
- fixed JSON response parsing to wrap numeric keys in quotes ([sc-85635](https://app.shortcut.com/active-prospect/story/85635/error-when-clicking-on-first-step-of-lead-details))
- minor package updates & a few lint fixes

## [2.23.4] - 2023-01-30
### Added
- added support for `PATCH` requests for JSON and XML integrations ([sc-47206](https://app.shortcut.com/active-prospect/story/47206/add-support-for-patch-to-custom-integrations))

## [2.23.2]- 2023-05-04
### Fixed
- roll back upgrade to `flat` in previous PR that broke XPath parsing

## [2.23.0]- 2023-04-25
### Added
- add support for `follow_redirects` request variable flag to JSON, form, query, & XML integrations ([sc-51845](https://app.shortcut.com/active-prospect/story/51845/make-custom-integration-able-to-follow-all-redirects)

## [2.22.0]- 2022-08-25
### Added
- added support for fallback_price

## [2.21.2] - 2022-07-05
### Fixed
- allow private IP/domains for local and test Node Environments

## [2.21.1] - 2022-07-05
### Fixed
- fix ssrf vulnerabilities

## [2.21.0] - 2022-05-02
### Added
- added support for capturing a reference ID

## [2.20.0] - 2021-06-23
### Added
- added support for basic auth credentials for JSON integration

## [2.19.3] - 2021-05-20
### Fixed
- array responses are now appended under an `array.` property

## [2.19.1] - 2021-02-25
### Fixed
- fix npm vulnerabilities

## [2.18.6] - 2021-02-22
### Added
- Allow setting outcome on match to `error`

## [2.18.5] - 2020-06-30
### Added
- JSON integration now supports the extra nested parameters variable

## [2.18.4] - 2020-04-02
### Added
- JSON, XML, Form and Post integration now support basic username and password authorization

## [2.18.3] - 2020-03-27
### Fixed
- Decaffeinated the integration

## [2.18.2] - 2020-02-19
### Fixed
- 'price' is now parsed regardless of presence of success vars

## [2.18.1] - 2018-08-28
### Fixed
- Guard against bogus searchpath

## [2.18.0] - 2018-10-31
### Added
- Capture 'price' response variable

## [2.17.0] - 2018-08-28
### Added
- Support wildcards in reason parsing

## [2.16.1] - 2018-08-16
### Fixed
- update soap package to remove security vulns

## [unreleased] - 2018-08-03
### Added
- test to verify and demonstrate setting SOAP attributes

### Fixed
- failing SOAP header test

## [2.16.0] - 2017-09-01
### Added
- compact arrays created in "Form POST" `form_field` parameters

## [2.15.0] - 2017-08-28
### Added
- new parameter on "Form POST", `encode_form_field_names`; defaults to true

## [2.14.3] - 2017-06-06
### Fixed
- fix to parse reason text from JSON array response

## [2.14.2] - 2017-05-11
### Fixed
- compact arrays for SOAP transactions

## [2.14.1] - 2017-03-06
### Fixed
- fix to cookie header search to ignore case

## [2.14.0] - 2017-03-06
### Added
- add ability to capture cookie headers via `cookie_search_term`

## [2.10.0] - 2016-10-05
### Added
- added ability to override response `Content-Type` (issue #32)

## [2.9.1] - 2016-09-21
### Fixed
- support "capture" fields in HTML responses, too
- clean up "reason" text extracted from XML CDATA

## [2.9.0] - 2016-09-14
### Added
- Can now specify "capture" fields and mapped regular expressions with capture groups to populate them

## [2.8.4] - 2016-08-29
### Fixed
- `form_field.*` field names with brackets are correctly preserved (issue #8)

## [2.8.3] - 2016-08-25
### Fixed
- When all `json_property` values have a leading digit, assume the user wants a root array.

## [2.8.2] - 2016-07-09
### Fixed
- add `send_ascii` to SOAP integrations request variables

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
