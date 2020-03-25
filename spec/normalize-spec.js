// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  assert
} = require('chai');
const normalize = require('../src/normalize');
const types = require('leadconduit-types');


describe('Normalize', function() {

  let obj = {};

  before(() => obj = {
    first_name: 'Böb',                                   // a plain string
    address_1: types.street.parse('17 Kronprinzstraße'), // a valid rich type
    postal_code: types.postal_code.parse('Kölsch'),      // an invalid rich type
    something_null: null
  });                                // a null value

  it('should leave character set as-is', () => assert.deepEqual(normalize(obj), { first_name: 'Böb', address_1: '17 Kronprinzstraße', postal_code: 'Kölsch', something_null: null }));

  return it('should change character set to ASCII', () => assert.deepEqual(normalize(obj, true), { first_name: 'Bob', address_1: '17 Kronprinzstrasse', postal_code: 'Kolsch', something_null: null }));
});
