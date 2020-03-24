const assert = require('chai').assert;
const compact = require('../lib/compact');

describe('Compact', () => {
  it('should compact array', () => {
    assert.deepEqual(compact([1, 2, null, 4]), [1, 2, 4]);
  })

  it('should compact object property array', () => {
    assert.deepEqual(compact({ foo: [1, 2, null, 4] }), { foo: [1, 2, 4]});
  })

  it('should compat nested array', () => {
    assert.deepEqual(compact([1, 2, ['a', null, 'c'], 4]), [1, 2, ['a', 'c'], 4]);
  })

  it('should compact array nested in object property array', () => {
    assert.deepEqual(compact({ foo: [1, 2, { bar: [ 'a', null, 'c']}, 4]}), { foo: [1, 2, { bar: ['a', 'c']}, 4]})
  })
})