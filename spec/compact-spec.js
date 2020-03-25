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
const compact = require('../src/compact');

describe('Compact', function() {


  it('should compact array', () => assert.deepEqual(compact([1, 2, null, 4]), [1, 2, 4]));


  it('should compact object property array', () => assert.deepEqual(compact({foo: [1, 2, null, 4]}), {foo: [1, 2, 4]}));


  it('should compact nested array', () => assert.deepEqual(compact([1, 2, ['a', null, 'c'], 4]), [1, 2, ['a', 'c'], 4]));


  return it('should compact array nested in object property array', () => assert.deepEqual(compact({foo: [1, 2, { bar: [ 'a', null, 'c' ]}, 4]}), {foo: [1, 2, { bar: ['a', 'c'] }, 4]}));
});



