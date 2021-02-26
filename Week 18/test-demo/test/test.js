var assert = require('assert');
import {add, mul} from '../add'

// var add = require('../add').add
// var mul = require('../add').mul
describe('add function testing', function () {
  it('1 + 2 shuold be 3', function() {
    assert.equal(add(1, 2), 3);
  });
  it('-5 + 2 shuold be -3', function() {
    assert.equal(mul(5, 3), 15);
  });
})
